export const professionals = [
  {
    id: 1,
    name: "Manolo Cáceres Artesero",
    profession: "Plomero",
    experience: 20,
    description:
      '"Soy plomero con todos los de la ley, y laburo como lo hago siempre"',
    historia:
      '"Plomero con título técnico con experiencia en reparaciones, instalaciones y colocación de cañerías."',
    image: require("../images/plomero1.png"),
    rating: 4.8,
    opinions: [
      { user: "@Lucas89", comment: "Excelente trabajo, rápido y prolijo." },
      { user: "@Anita", comment: "Cumplió en tiempo y forma, súper recomendable." },
    ],
    contact: {
      phone: "+54 9 11 2233-4455",
      email: "manolo.plomero@example.com",
    },
    services: [
      "Instalación de cañerías",
      "Reparaciones en baños y cocinas",
      "Colocación de calefones",
    ],
    distanceKm: 4,
    tags: ["Popular", "Verificado"],
  },
  {
    id: 2,
    name: "Gustavo Román",
    profession: "Plomero",
    experience: 10,
    description: '"Experto en reparaciones y mantenimiento de tuberías hogareñas"',
    historia:
      '"Plomero matriculado con experiencia en reparaciones, instalaciones y colocación de calefones."',
    image: require("../images/plomero2.png"),
    rating: 4.6,
    opinions: [
      { user: "@RocioG", comment: "Muy buena atención y servicio." },
      { user: "@Juanito", comment: "Eficiente y económico." },
    ],
    contact: {
      phone: "+54 9 11 6677-8899",
      email: "gustavo.roman@example.com",
    },
    services: [
      "Mantenimiento de sistemas de agua",
      "Instalación de artefactos sanitarios",
      "Reparación de pérdidas",
    ],
    distanceKm: 12,
    tags: ["Matriculado"],
  },
  {
    id: 3,
    name: "Jonathan Leguizamón",
    profession: "Plomero",
    experience: 1,
    description: '"Es fácil ser plomero" 😁',
    historia:
      '"Plomero matriculado con experiencia en reparaciones, instalaciones y mantenimiento de sistemas de agua y gas. Más de 15 años de trayectoria brindando soluciones rápidas y eficientes en destapaciones, arreglos de cañerías, colocación sanitaria y calefones."',
    image: require("../images/plomero3.png"),
    rating: 4.4,
    opinions: [
      { user: "@Mariano76", comment: "Muy prolijo y económico." },
      { user: "@CarlaZ", comment: "Me salvó con una pérdida un domingo, un genio." },
    ],
    contact: {
      phone: "+54 9 11 9999-1234",
      email: "jonathan.plomero@example.com",
    },
    services: [
      "Destapaciones",
      "Colocación de artefactos",
      "Reparación de pérdidas de gas",
    ],
    distanceKm: 8,
    tags: ["Popular"],
  },
];
