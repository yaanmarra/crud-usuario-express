const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// GET /
app.get("/", (req, res) => {
  res.json({ msg: "API Express + Prisma OK!" });
});

// POST /usuarios (cria usuário + perfil junto)
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil?.perfil_nome) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, email, senha, perfil.perfil_nome" });
    }

    // Regra: email não pode duplicar
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha,
        perfil: {
          create: {
            perfilNome: perfil.perfil_nome
          }
        }
      },
      include: { perfil: true }
    });

    // Ajustar saída para ficar igual ao enunciado (perfil_nome)
    return res.status(201).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: {
        id: user.perfil.id,
        perfil_nome: user.perfil.perfilNome
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// GET /usuarios (listar com perfil junto)
app.get("/usuarios", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { perfil: true }
    });

    const output = users.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: {
        id: u.perfil.id,
        perfil_nome: u.perfil.perfilNome
      }
    }));

    return res.json(output);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// GET /usuarios/:id
app.get("/usuarios/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { perfil: true }
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: {
        id: user.perfil.id,
        perfil_nome: user.perfil.perfilNome
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// PUT /usuarios/:id (atualiza usuário e/ou perfil_nome)
app.put("/usuarios/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, senha, perfil_nome } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { perfil: true }
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Se mudar email, validar duplicado
    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: "Email já cadastrado" });
    }

    // Atualiza user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nome: nome ?? user.nome,
        email: email ?? user.email,
        senha: senha ?? user.senha
      },
      include: { perfil: true }
    });

    // Atualiza perfil se vier perfil_nome
    let finalUser = updatedUser;
    if (perfil_nome) {
      await prisma.profile.update({
        where: { id: updatedUser.perfilId },
        data: { perfilNome: perfil_nome }
      });

      finalUser = await prisma.user.findUnique({
        where: { id },
        include: { perfil: true }
      });
    }

    return res.json({
      id: finalUser.id,
      nome: finalUser.nome,
      email: finalUser.email,
      perfil: {
        id: finalUser.perfil.id,
        perfil_nome: finalUser.perfil.perfilNome
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// DELETE /usuarios/:id
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // deletar user e profile junto
    await prisma.user.delete({ where: { id } });
    await prisma.profile.delete({ where: { id: user.perfilId } });

    return res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));