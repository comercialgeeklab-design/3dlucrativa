# ⚡ COMECE AQUI - 3 Passos para Testar PIX

## 🎯 O Que Você Fez Pedir

✅ **Preços:** Mudados para **R$ 0,01** e **R$ 0,02** (para teste)
✅ **Automação:** Plano agora ativa **AUTOMATICAMENTE**
✅ **Admin:** Não precisa mais **aprovar nada** (tudo automático!)

---

## 🚀 Como Começar (3 passos)

### 1️⃣ Migrar Banco de Dados

```bash
# Abra o terminal na pasta do projeto e execute:
npm run typeorm migration:run

# Ou deixe sincronizar automaticamente:
npm run dev
# (vai sincronizar sozinho se tiver synchronize: true)
```

**O que vai acontecer:**
- Será adicionado campo `planActivatedAt` na tabela `users`

### 2️⃣ Reiniciar Servidor

```bash
npm run dev
```

**Pronto!** Servidor rodando em `http://localhost:3000`

### 3️⃣ Testar PIX

```
1. Acesse: http://localhost:3000/payment/mercadopago

2. Clique em "PIX / QR Code"

3. Clique em "Gerar QR Code"

4. Escaneie o QR Code com seu telefone

5. Faça o PIX (R$ 0,01 ou R$ 0,02)

6. ✅ PRONTO! Seu plano ativa automaticamente!
```

---

## ✨ O Que Você Deve Ver

### Tela após "Gerar QR Code":
```
┌──────────────────────────────┐
│  Escaneie o QR Code abaixo   │
│                              │
│   ┌──────────────────────┐  │
│   │  [QR CODE IMAGE]     │  │
│   └──────────────────────┘  │
│                              │
│  Aguardando confirmação do   │
│  pagamento...               │
│                              │
│  [Gerar novo QR Code]        │
└──────────────────────────────┘
```

### Após fazer o PIX (com webhook):
```
┌──────────────────────────────┐
│  ✅ Pagamento confirmado!   │
│                              │
│  Seu pagamento foi          │
│  processado com sucesso.     │
│                              │
│  Acesso ao plano liberado! 🎉 │
└──────────────────────────────┘
```

---

## 💰 Preços Agora

| Plano | Valor | Nota |
|-------|-------|------|
| Intermediário | **R$ 0,01** | 1 centavo (super barato!) |
| Avançado | **R$ 0,02** | 2 centavos (super barato!) |

---

## 🔍 Verificar Se Funcionou

### No Navegador (F12 - Console):
```javascript
// Deve aparecer:
"QR Code PIX gerado com sucesso!"
// Depois (se fizer o PIX):
"Pagamento aprovado!"
```

### No Terminal (npm run dev):
```
✅ Plano ativado automaticamente para usuário: {
  userId: 'xxx',
  plan: 'intermediario',
  timestamp: '2026-01-17...'
}
```

### No Banco (SQL):
```sql
-- Verificar se plano foi ativado
SELECT email, plan, planActivatedAt FROM users LIMIT 1;
-- Deve mostrar:
-- plan: 'intermediario' ou 'avancado'
-- planActivatedAt: 2026-01-17 ... (data/hora)
```

---

## ⚠️ Possíveis Erros e Soluções

| Erro | Solução |
|------|---------|
| "planActivatedAt não existe" | Execute migração (passo 1) |
| QR Code não aparece | Verifique console (F12) para erros |
| Webhook não funciona | Precisa Ngrok (veja próximo) |
| "Token inválido" | Configure .env.local |

---

## 🔌 Se Quiser Testar Webhook (Opcional)

### Instalar Ngrok:
```bash
# Windows (chocolatey):
choco install ngrok

# Ou baixar: https://ngrok.com/download
```

### Rodar Ngrok:
```bash
# Em novo terminal:
ngrok http 3000

# Copie a URL gerada (ex: https://abc123.ngrok.io)
```

### Configurar em Mercado Pago:
```
1. https://www.mercadopago.com.br/developers/panel
2. Account Settings
3. Webhooks
4. Clique "Add notification URL"
5. Cole: https://abc123.ngrok.io/api/payment/webhook
6. Selecione eventos:
   ☑️ payment.created
   ☑️ payment.updated
7. Save
```

### Agora Testar:
```
Faça PIX normalmente
→ Webhook será chamado automaticamente
→ Status atualiza
→ Plano ativa automaticamente
```

---

## 📚 Documentação Completa

Se quiser saber mais, leia:

1. **[SUMARIO_FINAL.md](./SUMARIO_FINAL.md)** - Visão geral completa
2. **[MUDANCAS_REALIZADAS.md](./MUDANCAS_REALIZADAS.md)** - O que mudou
3. **[MERCADO_PAGO_TESTE_PIX.md](./MERCADO_PAGO_TESTE_PIX.md)** - Teste detalhado
4. **[PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md)** - Próximas etapas

---

## 🎯 Checklist Rápido

```
[ ] npm run typeorm migration:run (ou deixar sincronizar)
[ ] npm run dev
[ ] Acesso http://localhost:3000/payment/mercadopago
[ ] Clique "PIX / QR Code"
[ ] Clique "Gerar QR Code"
[ ] QR Code aparece
[ ] (OPCIONAL) Escaneie e faça PIX real
[ ] (OPCIONAL) Verifique logs do servidor
[ ] (OPCIONAL) Verifique banco de dados
[ ] ✅ PRONTO!
```

---

## 🎉 Pronto!

Tudo está configurado para testar PIX!

**Status:**
- ✅ Preços: R$ 0,01 e R$ 0,02
- ✅ Automação: Plano ativa automaticamente
- ✅ Admin: Não precisa aprovar mais
- ✅ PIX: QR Code funcional
- ✅ Webhook: Implementado (com Ngrok)

**Próximo passo:** Execute os 3 passos acima! 🚀

---

**Criado em:** 17 de Janeiro de 2026
**Tempo de leitura:** 5 minutos
**Tempo para começar:** 1 minuto

👉 **Vamos começar?**
