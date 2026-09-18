"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: number;
  nome: string;
  whatsapp: string;
  renda: string;
  finalidade: string;
  profissao: string;
  bairro_preferencia: string;
  bairro: string;
  status: string;
};

export default function CorretorPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(true);

  useEffect(() => {
    verificarLogin();
  }, []);

  async function verificarLogin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setVerificandoLogin(false);
    carregarLeads();
  }

  async function carregarLeads(mostrarCarregando = true) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    if (mostrarCarregando) {
      setCarregando(true);
    } else {
      setAtualizando(true);
    }

    const { data: corretor, error: erroCorretor } = await supabase
      .from("corretores")
      .select("id, nome")
      .eq("auth_user_id", user.id)
      .single();

    if (erroCorretor || !corretor) {
      console.error("ERRO AO BUSCAR CORRETOR:", erroCorretor);
      alert("Corretor não encontrado.");
      setCarregando(false);
      setAtualizando(false);
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("corretor_id", corretor.id)
      .order("id", { ascending: false });

    if (error) {
      console.error("ERRO AO BUSCAR LEADS:", error);
      setCarregando(false);
      setAtualizando(false);
      return;
    }

    setLeads(data || []);
    setCarregando(false);
    setAtualizando(false);
  }

  const leadsFiltrados = leads.filter((lead) => {
    const termo = pesquisa.toLowerCase();

    return (
      lead.nome.toLowerCase().includes(termo) ||
      lead.whatsapp.includes(termo)
    );
  });

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Verificando acesso...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              VANGUARD
            </h1>

            <p className="text-xs tracking-[0.25em] text-cyan-400">
              ÁREA DO CORRETOR
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            Meus Leads
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Meus Leads
          </h2>

          <p className="mt-2 text-slate-400">
            Leads distribuídos para você.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <span className="text-sm text-slate-400">
              Total de leads
            </span>

            <span className="text-2xl font-bold text-cyan-400">
              {leads.length}
            </span>
          </div>

          <div className="mt-5">
            <input
              type="text"
              placeholder="Pesquisar por nome ou WhatsApp..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <br />

          <button
            onClick={() => carregarLeads(false)}
            disabled={atualizando}
            className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {atualizando ? "Atualizando..." : "Atualizar leads"}
          </button>
        </div>

        {carregando ? (
          <p className="text-slate-400">
            Carregando leads...
          </p>
        ) : leadsFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-400">
              Nenhum lead encontrado.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {leadsFiltrados.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {lead.nome}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Lead #{lead.id}
                    </p>
                  </div>

                  <select
                    value={lead.status}
                    onChange={async (e) => {
                      const novoStatus = e.target.value;

                      setLeads((leadsAtuais) =>
                        leadsAtuais.map((item) =>
                          item.id === lead.id
                            ? { ...item, status: novoStatus }
                            : item
                        )
                      );

                      const { error } = await supabase
                        .from("leads")
                        .update({ status: novoStatus })
                        .eq("id", lead.id);

                      if (error) {
                        console.error(
                          "ERRO AO ATUALIZAR STATUS:",
                          error
                        );

                        alert(
                          "Não foi possível salvar o status."
                        );
                      }
                    }}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-cyan-300 outline-none"
                  >
                    <option value="Novo Lead">
                      Novo Lead
                    </option>

                    <option value="Em atendimento">
                      Em atendimento
                    </option>

                    <option value="Reunião Agendada">
                      Visita Agendada
                    </option>

                    <option value="Ganho">
                      Fechado
                    </option>

                    <option value="Perdido">
                      Perdido
                    </option>

                    <option value="Sem interesse">
                      Sem interesse
                    </option>
                  </select>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <strong>WhatsApp:</strong>{" "}
                    {lead.whatsapp}
                  </p>

                  <p>
                    <strong>Renda:</strong>{" "}
                    {lead.renda}
                  </p>

                  <p>
                    <strong>Finalidade:</strong>{" "}
                    {lead.finalidade}
                  </p>

                  <p>
                    <strong>Profissão:</strong>{" "}
                    {lead.profissao}
                  </p>

                  <p>
                    <strong>Bairro:</strong>{" "}
                    {lead.bairro}
                  </p>
                </div>

                <a
                 href={`https://wa.me/${
  lead.whatsapp.replace(/\D/g, "").startsWith("55")
    ? lead.whatsapp.replace(/\D/g, "")
    : "55" + lead.whatsapp.replace(/\D/g, "")
}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block rounded-xl bg-cyan-500 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Abrir WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}