import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ConfirmarEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('carregando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('erro');
      setMensagem('Token de confirmação não informado.');
      return;
    }

    const confirmarEmail = async () => {
      try {
        const response = await api.get(
          `/api/registro/confirmar?token=${encodeURIComponent(token)}`
        );

        setStatus('sucesso');
        setMensagem(
          response.data?.mensagem ||
            'E-mail confirmado com sucesso! Você já pode fazer o login.'
        );
      } catch (error) {
        setStatus('erro');
        setMensagem(
          error.response?.data?.mensagem ||
            'Não foi possível confirmar seu e-mail. O link pode ter expirado ou ser inválido.'
        );
      }
    };

    confirmarEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
        {status === 'carregando' && (
          <>
            <div className="mx-auto mb-6 h-10 w-10 rounded-full border-4 border-stone-200 border-t-stone-700 animate-spin" />

            <h1 className="text-2xl font-semibold text-stone-900">
              Confirmando seu e-mail...
            </h1>

            <p className="mt-3 text-stone-600">
              Aguarde enquanto validamos seu link de confirmação.
            </p>
          </>
        )}

        {status === 'sucesso' && (
          <>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 text-2xl">
              ✓
            </div>

            <h1 className="text-2xl font-semibold text-stone-900">
              E-mail confirmado!
            </h1>

            <p className="mt-3 text-stone-600">
              {mensagem}
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 font-medium text-white transition hover:bg-stone-800"
            >
              Ir para o login
            </Link>
          </>
        )}

        {status === 'erro' && (
          <>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 text-2xl">
              !
            </div>

            <h1 className="text-2xl font-semibold text-stone-900">
              Não foi possível confirmar
            </h1>

            <p className="mt-3 text-stone-600">
              {mensagem}
            </p>

            <Link
              to="/cadastro"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Voltar para o cadastro
            </Link>

            <Link
              to="/login"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 font-medium text-white transition hover:bg-stone-800"
            >
              Ir para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}