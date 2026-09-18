"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [bairroPreferencia, setBairroPreferencia] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const dados = new FormData(form);

    // Busca todos os corretores ativos
    const { data: corretores, error: erroCorretores } = await supabase
      .from("corretores")
      .select("id, ultimo_recebimento")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (erroCorretores) {
      console.error("ERRO AO BUSCAR CORRETORES:", erroCorretores);
      alert("Erro ao buscar corretores disponíveis.");
      return;
    }

    if (!corretores || corretores.length === 0) {
      alert("Nenhum corretor disponível.");
      return;
    }

    // Escolhe o corretor que recebeu menos leads
    const corretor = corretores.reduce(
      (menor, atual) =>
        (atual.ultimo_recebimento ?? 0) <
        (menor.ultimo_recebimento ?? 0)
          ? atual
          : menor,
      corretores[0]
    );

    const lead = {
      nome: dados.get("nome"),
      whatsapp: dados.get("whatsapp"),
      renda: dados.get("renda"),
      finalidade: dados.get("finalidade"),
      profissao: dados.get("profissao"),
      bairro_preferencia: bairroPreferencia,
      bairro: dados.get("bairro") || "Não informado",
      status: "Novo Lead",
      corretor_id: corretor.id,
    };

    // Salva o lead
    const { error } = await supabase
      .from("leads")
      .insert([lead]);

    if (error) {
      console.error(
        "ERRO AO SALVAR LEAD:",
        JSON.stringify(error, null, 2)
      );

      alert("Erro ao enviar os dados. Tente novamente.");
      return;
    }

    console.log("LEAD SALVO COM SUCESSO:", lead);

    // Atualiza o contador do corretor
    const novoTotal = (corretor.ultimo_recebimento ?? 0) + 1;

    const { error: erroAtualizacao } = await supabase
      .from("corretores")
      .update({
        ultimo_recebimento: novoTotal,
      })
      .eq("id", corretor.id);

    if (erroAtualizacao) {
      console.error(
        "ERRO AO ATUALIZAR RODÍZIO:",
        erroAtualizacao
      );
    }

    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
    {/* HEADER */}
    <header className="border-b border-white/10 bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* VANGUARD */}
        <div>
          <h1 className="text-2xl font-bold tracking-[0.25em] text-white">
            VANGUARD
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-cyan-400">
  SONHARE
</p>
        </div>

        {/* LOGO SONHARE */}
        <div className="flex items-center">
          <img
            src="/logos/sonhare.png"
            alt="Sonhare Imóveis"
            className="h-28 w-auto object-contain"
          />
        </div>

      </div>
    </header>
      <section className="relative overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-2 lg:py-20">
          
          {/* LADO ESQUERDO */}
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              ANÁLISE DE CRÉDITO GRATUITA
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight md:text-6xl">
              Descubra quanto você pode
              <span className="text-cyan-400">
                {" "}investir no seu imóvel.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Informe alguns dados e nossa equipe irá analisar seu perfil para
              encontrar oportunidades de imóveis de acordo com sua renda e seus
              objetivos.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-2xl">🏠</div>

                <h3 className="mt-3 font-semibold">
                  Conquiste seu novo lar
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Opções de acordo com seu perfil.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-2xl">💳</div>

                <h3 className="mt-3 font-semibold">
                  Analise seu crédito
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Atendimento inicial sem custo.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
              <p className="text-sm font-medium text-cyan-300">
                🔒 Seus dados são utilizados apenas para o atendimento
                imobiliário.
              </p>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl md:p-9">
            {!enviado ? (
              <>
                <div className="mb-7">
                  <p className="text-sm font-bold tracking-widest text-cyan-600">
                    ATENDIMENTO VANGUARD
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    Faça sua análise gratuita
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Preencha seus dados e um de nossos corretores entrará em
                    contato.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* NOME */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Seu nome
                    </label>

                    <input
                      required
                      name="nome"
                      type="text"
                      placeholder="Digite seu nome"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* WHATSAPP */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      WhatsApp
                    </label>

                    <input
                      required
                      name="whatsapp"
                      type="tel"
                      placeholder="(83) 99999-9999"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* RENDA */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Renda mensal
                    </label>

                    <select
                      required
                      name="renda"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value="">
                        Selecione sua renda
                      </option>

                      <option>Até R$ 2.000</option>
                      <option>R$ 2.001 a R$ 3.000</option>
                      <option>R$ 3.001 a R$ 5.000</option>
                      <option>R$ 5.001 a R$ 8.000</option>
                      <option>R$ 8.001 a R$ 12.000</option>
                      <option>Acima de R$ 12.000</option>
                    </select>
                  </div>

                  {/* FINALIDADE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Qual a finalidade do imóvel?
                    </label>

                    <select
                      required
                      name="finalidade"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value="">
                        Selecione
                      </option>

                      <option>Moradia</option>
                      <option>Investimento</option>
                    </select>
                  </div>

                  {/* PROFISSÃO */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Você trabalha...
                    </label>

                    <select
                      required
                      name="profissao"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value="">
                        Selecione
                      </option>

                      <option>CLT</option>
                      <option>Autônomo</option>
                    </select>
                  </div>

                  {/* BAIRRO */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Tem preferência de bairro?
                    </label>

                    <select
                      required
                      value={bairroPreferencia}
                      onChange={(e) =>
                        setBairroPreferencia(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value="">
                        Selecione
                      </option>

                      <option value="nao">
                        Não tenho preferência
                      </option>

                      <option value="sim">
                        Sim
                      </option>
                    </select>
                  </div>

                  {/* CAMPO BAIRRO */}
                  {bairroPreferencia === "sim" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Qual bairro você procura?
                      </label>

                      <input
                        required
                        name="bairro"
                        type="text"
                        placeholder="Ex.: Manaíra, Bessa, Bancários..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  )}

                  {/* BOTÃO */}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-500 px-5 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    QUERO FAZER MINHA ANÁLISE GRATUITA
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Ao enviar, você concorda em receber contato da equipe
                    Vanguard.
                  </p>
                </form>
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-4xl">
                  ✓
                </div>

                <h3 className="mt-6 text-3xl font-bold">
                  Solicitação recebida!
                </h3>

                <p className="mt-3 text-slate-500">
                  Obrigado pelo interesse. Nossa equipe Vanguard entrará em
                  contato com você em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="font-semibold">
          VANGUARD
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Negócios imobiliários
        </p>
      </footer>
    </main>
  );
}