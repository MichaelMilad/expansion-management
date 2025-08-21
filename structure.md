src/
├── app.module.ts // The main entry point
├── auth/ // Module for JWT authentication
│ ├── auth.controller.ts
│ ├── auth.service.ts
│ ├── auth.module.ts
│ └── strategies/
│ └── jwt.strategy.ts
├── projects/ // Module for all project-related logic
│ ├── projects.controller.ts
│ ├── projects.service.ts
│ ├── projects.module.ts
│ ├── dto/
│ │ ├── create-project.dto.ts
│ │ └── update-project.dto.ts
│ └── entities/
│ └── project.entity.ts // Or just use the Prisma model types
├── vendors/ // Module for all vendor-related logic
│ ├── vendors.controller.ts
│ └── ...
├── research/ // Module for MongoDB research documents
│ ├── research.controller.ts
│ ├── research.service.ts
│ ├── research.module.ts
│ └── schemas/
│ └── research.schema.ts // Mongoose schema
├── prisma/ // Dedicated for the Prisma client & migrations
│ └── prisma.service.ts
│ └── prisma.module.ts
└── main.ts
