'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sesionLista, setSesionLista] = useState(false);

  useEffect(() => {
    const revisarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSesionLista(Boolean(session));
    };

    revisarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSesionLista(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const guardarPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMensaje('');

    if (password.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmar) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMensaje(`Error: ${error.message}`);
      setCargando(false);
      return;
    }

    setMensaje('✅ Contraseña creada correctamente.');

    setTimeout(() => {
      window.location.href = '/test-auth';
    }, 1500);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#020617',
        color: 'white',
        padding: '30px',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          margin: '70px auto',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <h1>JF Equipos</h1>
        <h2>Crear contraseña</h2>

        {!sesionLista ? (
          <p style={{ color: '#fbbf24', marginTop: '20px' }}>
            Abre esta página desde el enlace de invitación enviado por correo.
          </p>
        ) : (
          <form onSubmit={guardarPassword} style={{ marginTop: '25px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  background: '#020617',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  background: '#020617',
                  color: '#fff',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '12px',
                border: 0,
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              {cargando ? 'Guardando...' : 'Crear contraseña'}
            </button>
          </form>
        )}

        {mensaje && (
          <p style={{ marginTop: '20px', color: '#cbd5e1' }}>
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}