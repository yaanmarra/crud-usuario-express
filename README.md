# CRUD Usuário + Perfil (Express + Prisma + MySQL)

Projeto desenvolvido utilizando **Node.js + Express + Prisma ORM + MySQL**, implementando relacionamento 1:1 entre Usuário e Perfil.

---

## Regras implementadas

- Relacionamento 1:1 (Usuário → Perfil)
- CRUD completo de Usuário
- Email não pode duplicar
- Criação de usuário junto com perfil
- Listagem traz dados do perfil automaticamente

---

## Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- MySQL

---

## Como rodar o projeto

###  Instalar dependências

```bash
npm install
```

---

###  Criar banco no MySQL

Criar um banco com o nome:

```sql
CREATE DATABASE crud_usuario;
```

---

###  Configurar o arquivo `.env`

Criar um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/crud_usuario"
```

Substituir:
- `SUA_SENHA` pela senha do seu MySQL

---

###  Rodar as migrations

```bash
npx prisma migrate dev --name init
```

---

### Iniciar o servidor

```bash
npm run dev
```

Servidor disponível em:

```
http://localhost:3000
```

---

##  Endpoints disponíveis

- `GET /usuarios` → Listar usuários
- `GET /usuarios/:id` → Buscar usuário por ID
- `POST /usuarios` → Criar usuário com perfil
- `PUT /usuarios/:id` → Atualizar usuário
- `DELETE /usuarios/:id` → Deletar usuário

---

## Exemplo de criação de usuário (JSON)

```json
{
  "nome": "Yan",
  "email": "yan@email.com",
  "senha": "123",
  "perfil": {
    "perfil_nome": "Admin"
  }
}
```

---

## Observações

- O campo **email é único**
- Usuário e Perfil possuem relacionamento 1:1
- O Prisma é responsável pela comunicação com o banco
- As migrations criam automaticamente as tabelas