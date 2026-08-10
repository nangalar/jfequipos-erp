import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function obtenerAdministradorSolicitante(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return { error: 'Sesión no proporcionada.', status: 401 } as const;
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  const user = userData.user;

  if (userError || !user) {
    return { error: 'Sesión inválida o expirada.', status: 401 } as const;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, active, role_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.active === false) {
    return {
      error: 'El usuario no tiene un perfil activo.',
      status: 403,
    } as const;
  }

  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id, name')
    .eq('id', profile.role_id)
    .single();

  if (roleError || !role || role.name !== 'Administrador') {
    return {
      error: 'Solo un Administrador puede gestionar usuarios.',
      status: 403,
    } as const;
  }

  return { user } as const;
}

async function resolverRolYSucursal(
  roleName: string,
  branchId: number | null
) {
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id, name')
    .eq('name', roleName)
    .single();

  if (roleError || !role) {
    throw new Error('El rol seleccionado no existe.');
  }

  // El Administrador tiene acceso global y no requiere sucursal.
  if (role.name === 'Administrador') {
    return {
      roleId: role.id,
      branchId: null,
    };
  }

  // Todos los demás usuarios deben pertenecer a una sucursal.
  if (!branchId) {
    throw new Error(
      'Los usuarios no administradores deben tener una sucursal asignada.'
    );
  }

  const { data: branch, error: branchError } = await supabaseAdmin
    .from('branches')
    .select('id, status')
    .eq('id', branchId)
    .single();

  if (branchError || !branch || branch.status !== 'Activa') {
    throw new Error(
      'La sucursal seleccionada no existe o está inactiva.'
    );
  }

  return {
    roleId: role.id,
    branchId: branch.id,
  };
}

// ============================================================
// CREAR USUARIO
// ============================================================

export async function POST(req: NextRequest) {
  const solicitante = await obtenerAdministradorSolicitante(req);

  if ('error' in solicitante) {
    return NextResponse.json(
      { error: solicitante.error },
      { status: solicitante.status }
    );
  }

  try {
    const body = await req.json();

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const roleName = String(body.roleName || '').trim();

    const branchId =
      body.branchId == null
        ? null
        : Number(body.branchId);

    if (!fullName || !email || !roleName) {
      return NextResponse.json(
        {
          error:
            'Nombre, correo y rol son obligatorios.',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            'La contraseña temporal debe tener al menos 8 caracteres.',
        },
        { status: 400 }
      );
    }

    const acceso = await resolverRolYSucursal(
      roleName,
      branchId
    );

    // Crear usuario en Supabase Authentication.
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error:
            authError?.message ||
            'No fue posible crear el usuario en Auth.',
        },
        { status: 400 }
      );
    }

    // Crear perfil del ERP.
    const { error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email,
          role_id: acceso.roleId,
          branch_id: acceso.branchId,
          active: true,
        });

    // Si falla profiles, eliminamos también el usuario de Auth
    // para no dejar registros incompletos.
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(
        authData.user.id
      );

      return NextResponse.json(
        {
          error:
            `No se pudo crear el perfil: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: authData.user.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Error inesperado al crear el usuario.',
      },
      { status: 400 }
    );
  }
}

// ============================================================
// ACTUALIZAR USUARIO
// ============================================================

export async function PATCH(req: NextRequest) {
  const solicitante = await obtenerAdministradorSolicitante(req);

  if ('error' in solicitante) {
    return NextResponse.json(
      { error: solicitante.error },
      { status: solicitante.status }
    );
  }

  try {
    const body = await req.json();

    const id = String(body.id || '').trim();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();

    const password = body.password
      ? String(body.password)
      : '';

    const roleName = String(body.roleName || '').trim();

    const branchId =
      body.branchId == null
        ? null
        : Number(body.branchId);

    const active = body.active !== false;

    if (!id || !fullName || !email || !roleName) {
      return NextResponse.json(
        {
          error:
            'ID, nombre, correo y rol son obligatorios.',
        },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        {
          error:
            'La nueva contraseña debe tener al menos 8 caracteres.',
        },
        { status: 400 }
      );
    }

    // Evita que el Administrador que está operando
    // desactive accidentalmente su propia cuenta.
    if (
      id === solicitante.user.id &&
      !active
    ) {
      return NextResponse.json(
        {
          error:
            'El Administrador no puede desactivar su propia cuenta.',
        },
        { status: 400 }
      );
    }

    const acceso = await resolverRolYSucursal(
      roleName,
      branchId
    );

    const authUpdate: Record<string, any> = {
      email,
      user_metadata: {
        full_name: fullName,
      },
    };

    if (password) {
      authUpdate.password = password;
    }

    // Actualizar Supabase Authentication.
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(
        id,
        authUpdate
      );

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message,
        },
        { status: 400 }
      );
    }

    // Actualizar perfil del ERP.
    const { error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          email,
          role_id: acceso.roleId,
          branch_id: acceso.branchId,
          active,
        })
        .eq('id', id);

    if (profileError) {
      return NextResponse.json(
        {
          error: profileError.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Error inesperado al actualizar el usuario.',
      },
      { status: 400 }
    );
  }
}