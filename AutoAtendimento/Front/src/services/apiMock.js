const products = [
  {
    id: 1,
    name: 'Paçoca Rolha Tradicional',
    category: 'Paçocas', 
    badge: 'Mais Vendido',
    description:
      'A clássica paçoca em formato rolha, com a textura perfeita que derrete na boca. Feita com amendoim selecionado.',
    fullDescription:
      'A clássica paçoca em formato rolha da A Caseira, produzida com amendoim selecionado e torrado no ponto certo. Textura que derrete na boca e sabor autêntico de infância. Embalagem individual termossoldada, ideal para exposição em gôndola e caixas de check-out com alto giro.',
    weight: '200g',
    guid: "paçoca-rolha-tradicional",
    packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
    images: [
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',  
      ],
  },
  {
    id: 2,
    name: 'Paçoca Rolha Amendoim Extra',
    category: 'Paçocas',
    price: 64.00,
    badge: null,
    description:
      'Versão premium com 20% mais amendoim. Sabor intenso, textura crocante e embalagem individual para PDV.',
    fullDescription:
      'Versão premium da Paçoca Rolha com 20% mais amendoim selecionado. Sabor intenso e autêntico, textura crocante que agrada ao público mais exigente. Embalagem individual termossoldada, perfeita para exposição em PDV e gôndolas de destaque.',
    weight: '200g',
    guid: "paçoca-rolha-amendoin-extra",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
        images: [
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',    ],
  },
  {
    id: 3,
    name: 'Pote Rolhão Tradicional',
    category: 'Paçocas',
    price: 54.00, 
    badge: null,
    description:
      'Pote com paçolinhas individuais, ideal para gôndolas e caixas de check-out. Alto giro garantido.',
    fullDescription:
      'Pote resistente com paçocas individuais, ideal para exposição em balcão e gôndolas de confeitaria. O clássico sabor do amendoim torrado em embalagem prática e com alta visibilidade no PDV. Alto giro garantido e excelente margem de contribuição.',
    weight: '450g',
    guid: "paçoca-rolhao",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',    
    images: [
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
    ],
  },
  {
    id: 4,
    name: 'Pote Rolhão Premium',
    category: 'Paçocas',
    price: 75.00,
    badge: 'Lançamento',
    description:
      'Embalagem reforçada com maior quantidade, ideal para atacarejo e grandes redes supermercadistas.',
    fullDescription:
      'Embalagem premium reforçada com maior volume de paçocas, desenvolvida especialmente para atacarejo e grandes redes supermercadistas. Maior margem por unidade e alta recompra garantida pelo sabor inconfundível da A Caseira.',
    weight: '600g',
    guid: "pote-rolhao",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
        images: [
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
        ],
  },
  {
    id: 5,
    name: 'Cocada Branca Tradicional',
    category: 'Cocadas',
    price: 60.00,
    badge: null,
    description:
      'Feita com coco fresco ralado na hora, cremosa, com adoçamento equilibrado e toque artesanal inconfundível.',
    fullDescription:
      'Preparada com coco fresco ralado na hora e adoçamento equilibrado, a Cocada Branca Tradicional é um clássico da confeitaria brasileira. Textura cremosa, sabor suave e visual apetitoso que encanta em qualquer vitrine ou gôndola.',
    weight: '200g',
guid: "cocada branca",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp', 
      images: [
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',      
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',      
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',    
    ],
  },
  {
    id: 6,
    name: 'Cocada Queimada',
    category: 'Cocadas',
    price: 67.50,
    badge: null,
    description:
      'Caramelizada no ponto certo, com cor dourada intensa e sabor de coco acentuado. Favorita do público adulto.',
    fullDescription:
      'Caramelizada artesanalmente no ponto exato, a Cocada Queimada tem cor dourada intensa e sabor de coco acentuado que conquista o público mais exigente. Produzida em pequenos lotes para garantir a consistência do ponto e da cor a cada fornada.',
    weight: '200g',
    guid: "cocada-queimada",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      images: [
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',      
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',      
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
        ],
  },
  {
    id: 7,
    name: 'Pingo de Leite',
    category: 'Doces de Leite',
    price: 64.00,
    badge: null, 
    description:
      'Bombom de leite condensado com casca fina de açúcar cristalizado. Derrete na boca e encanta na recompra.',
    fullDescription:
      'Delicado bombom de leite condensado revestido com uma fina casca de açúcar cristalizado. A textura que derrete na boca e o sabor suave e lácteo garantem alta recompra e fidelização de clientes. Um clássico do portfólio A Caseira.',
    weight: '300g',
guid: "pingo de leite",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      images: [
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',      
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',      
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',      
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',    ],
  },
  {
    id: 8,
    name: 'Bananinha Tradicional',
    category: 'Frutas',
    price: 48.00,
    badge: null,
    description:
      'Banana passa artesanal sem conservantes, com textura macia, sabor natural e longa vida de prateleira.',
    fullDescription:
      'Banana passa artesanal produzida sem conservantes artificiais, com processo de secagem controlado para preservar a textura macia e o sabor natural da fruta. Longa vida de prateleira e apelo saudável para o consumidor final.',
    weight: '200g',
    guid: "bananinha",
 packaging:[
      {
        id:"cx30",
        name:"Caixa 30 unidades",
        units:30,
        price : 72.00
      },
      { id:"cx60",
        name:"Caixa 60 unidades",
        units:60,
        price: 135.00
      }
    ],
    image: 'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
        images: [
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
      'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
      'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
      'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
        ],
  },
];

/**
 * Simula uma requisição assíncrona à API.
 * Substituir pelo fetch real quando o backend estiver disponível.
 */
export function fetchProducts() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(products), 800);
  });
}

export function fetchProductById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products.find((p) => p.id === Number(id)) ?? null);
    }, 600);
  });
}
