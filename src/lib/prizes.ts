// "Surpresa de prémios" no fim do Mundial. Textos e emojis centralizados aqui
// para serem fáceis de afinar. Português de Portugal, tom divertido entre amigos.
// Só aparece depois de o torneio terminar (ver src/lib/tournament.ts).

export const PRIZES = {
  // Bloco festivo no topo da classificação.
  banner: {
    eyebrow: "O Mundial acabou!",
    title: (champion: string) => `${champion} é o grande campeão`,
  },

  champion: {
    emoji: "🏆",
    label: "Campeão",
    // Mensagem completa (bloco de topo e cartão do 1.º lugar).
    message:
      "Parabéns, campeão! Ganhaste um jantar pago pelo último classificado 🍽️",
    // Etiqueta curta para o pódio.
    badge: "Campeão come à borla",
    badgeEmoji: "🍽️",
  },

  loser: {
    emoji: "🐢",
    label: "Último classificado",
    // Mensagem completa (menciona o nome do último).
    message: (loser: string) =>
      `${loser} chegou em último… paga o jantar ao campeão! 😅`,
    // Etiqueta curta para a linha/cartão do último.
    badge: "Último paga o jantar",
    badgeEmoji: "🐢",
  },
} as const;
