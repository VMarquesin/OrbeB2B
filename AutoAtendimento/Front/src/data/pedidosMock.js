export const pedidosMock = [
  {
    id: '10492',
    data: '15/10/2023',
    valor: 'R$ 1.250,00',
    status: 'Entregue',
    pagamento: 'Boleto Faturado 30 dias',
    endereco: 'Av. Central, 1500',
    itens: [
      {
        id: 1,
        nome: 'Paçoca Rolha Tradicional',
        codigo: 'PAC-RLH-500',
        qty: 15,
        unidade: 'caixas',
        subtotal: 'R$ 1.250,00',
        image: 'https://placehold.co/80x80/C2856A/FFF?text=Paçoca',
      },
    ],
  },
  {
    id: '10491',
    data: '10/10/2023',
    valor: 'R$ 2.450,00',
    status: 'Em Separação',
    pagamento: 'Pix (À vista)',
    endereco: 'Av. Central, 1500',
    itens: [
      {
        id: 1,
        nome: 'Display Paçoca Zero (24un)',
        codigo: 'PAC-Z-24',
        qty: 50,
        unidade: 'caixas',
        subtotal: 'R$ 2.450,00',
        image: 'https://placehold.co/80x80/C2856A/FFF?text=Paçoca+Zero',
      },
    ],
  },
  {
    id: '10490',
    data: '05/10/2023',
    valor: 'R$ 850,00',
    status: 'Faturado',
    pagamento: 'Boleto Faturado 60 dias',
    endereco: 'Av. Central, 1500',
    itens: [
      {
        id: 1,
        nome: 'Cocada Branca Tradicional',
        codigo: 'COC-BRA-200',
        qty: 20,
        unidade: 'caixas',
        subtotal: 'R$ 850,00',
        image: 'https://placehold.co/80x80/D4B896/5C3317?text=Cocada',
      },
    ],
  },
];
