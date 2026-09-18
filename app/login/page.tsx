"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    console.error("ERRO NO LOGIN:", error);
    alert("E-mail ou senha incorretos.");
    return;
  }

  if (email.toLowerCase() === "admin.1@vanguard.com") {
  window.location.href = "/admin";
} else {
  window.location.href = "/corretor";
}
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-wide">
            VANGUARD
          </h1>

          <p className="mt-2 text-sm tracking-[0.25em] text-cyan-400">
            ÁREA DO CORRETOR
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">

          <h2 className="text-2xl font-bold">
            Entrar
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Acesse sua área de corretor.
          </p>

          <form onSubmit={entrar} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Entrar
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}