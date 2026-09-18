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
  bairro: string;
  status: string;
  corretor_id: number | null;
  corretor_nome: string;
};

type Corretor = {
  id: number;
  nome: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCorretores, setTotalCorretores] = useState(0);
  const [leadsNovos, setLeadsNovos] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
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

if (user.email !== "admin.1@vanguard.com") {
  router.replace("/corretor");
  return;
}
    setVerificandoLogin(false);
    carregarDados();
  }

  async function carregarDados() {
    setCarregando(true);

    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    const { count: corretoresCount } = await supabase
      .from("corretores")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true);

    const { count: novosCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "Novo Lead");

    const { data: corretoresData, error: corretoresError } =
      await supabase
        .from("corretores")
        .select("id, nome");

    if (corretoresError) {
      console.error(
        "ERRO AO BUSCAR CORRETORES:",
        corretoresError
      );
    }

    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select(
        "id, nome, whatsapp, renda, finalidade, profissao, bairro, status, corretor_id"
      )
      .order("id", { ascending: false });

    if (leadsError) {
      console.error("ERRO AO BUSCAR LEADS:", leadsError);
    }

    const corretores = (corretoresData || []) as Corretor[];

    const leadsComCorretor: Lead[] = (leadsData || []).map(
      (lead) => {
        const corretor = corretores.find(
          (item) => item.id === lead.corretor_id
        );

        return {
          ...lead,
          corretor_nome:
            corretor?.nome || "Não informado",
        };
      }
    );

    setTotalLeads(leadsCount || 0);
    setTotalCorretores(corretoresCount || 0);
    setLeadsNovos(novosCount || 0);
    setLeads(leadsComCorretor);

    setCarregando(false);
  }

  const leadsFiltrados = leads.filter((lead) =>
    lead.nome
      .toLowerCase()
      .includes(pesquisa.toLowerCase())
  );

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
              PAINEL ADMINISTRATIVO
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            ADMIN
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold">
          Painel Administrativo
        </h2>

        <p className="mt-2 text-slate-400">
          Controle geral dos leads e corretores.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Total de Leads
            </p>

            <p className="mt-3 text-4xl font-bold text-cyan-400">
              {carregando ? "..." : totalLeads}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Corretores Ativos
            </p>

            <p className="mt-3 text-4xl font-bold text-cyan-400">
              {carregando ? "..." : totalCorretores}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Leads Novos
            </p>

            <p className="mt-3 text-4xl font-bold text-cyan-400">
              {carregando ? "..." : leadsNovos}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-bold">
              Todos os Leads
            </h3>

            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 md:w-80"
            />
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
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 py-4">Lead</th>
                    <th className="px-5 py-4">WhatsApp</th>
                    <th className="px-5 py-4">Renda</th>
                    <th className="px-5 py-4">Finalidade</th>
                    <th className="px-5 py-4">Profissão</th>
                    <th className="px-5 py-4">Bairro</th>
                    <th className="px-5 py-4">Corretor</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leadsFiltrados.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          {lead.nome}
                        </div>

                        <div className="text-xs text-slate-500">
                          #{lead.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {lead.whatsapp}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {lead.renda}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {lead.finalidade}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {lead.profissao}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {lead.bairro}
                      </td>

                      <td className="px-5 py-4 font-semibold text-cyan-300">
                        {lead.corretor_nome}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}