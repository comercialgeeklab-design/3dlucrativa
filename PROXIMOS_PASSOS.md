# 🚀 Próximos Passos - Migração e Testes

## ⚠️ IMPORTANTE: Executar Migração no Banco de Dados

Como adicionamos um novo campo à entidade `User` (`planActivatedAt`), você **precisa** rodar a migração:

### Opção 1: Sincronizar Automático (Desenvolvimento)

Se seu `data-source.ts` tem `synchronize: true`:

```bash
# 1. Reiniciar o servidor (vai sincronizar automaticamente)
npm run dev

# 2. Campo será criado automaticamente
```

### Opção 2: Migração Manual (Recomendado)

```bash
# 1. Gerar migração
npm run typeorm migration:generate -- -n AddPlanActivatedAtToUser

# 2. Executar migração
npm run typeorm migration:run

# 3. Verificar no banco
# SELECT * FROM users; -- Deve ter coluna "planActivatedAt"
```

### Opção 3: SQL Direto (PostgreSQL/MySQL)

```sql
-- PostgreSQL
ALTER TABLE users 
ADD COLUMN "planActivatedAt" TIMESTAMP NULL DEFAULT NULL;

-- MySQL
ALTER TABLE users 
ADD COLUMN planActivatedAt TIMESTAMP NULL DEFAULT NULL;
```

---

## ✅ Checklist Antes de Testar

```markdown
Antes de começar os testes PIX:

Código:
- [ ] Arquivos foram atualizados (preços, automação)
- [ ] Nenhum erro de sintaxe (verificar console)

Banco de Dados:
- [ ] Campo "planActivatedAt" foi adicionado à tabela users
- [ ] Migração executada com sucesso
- [ ] Sem erros ao conectar ao banco

Servidor:
- [ ] npm run dev está rodando
- [ ] Sem erros no console
- [ ] Acesso a http://localhost:3000 funciona

Mercado Pago:
- [ ] Variáveis de ambiente configuradas (.env.local)
- [ ] MERCADO_PAGO_ACCESS_TOKEN = TEST-...
- [ ] NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY = TEST-...

Pronto?
- [ ] Tudo acima configurado
- [ ] Vou começar os testes PIX
```

---

## 🧪 Teste PIX Passo a Passo

### 1️⃣ Sem Ngrok (Teste Básico)

```bash
# 1. Abra: http://localhost:3000/payment/mercadopago

# 2. Clique em "PIX / QR Code"

# 3. Clique em "Gerar QR Code"

# 4. Você verá:
   ✅ QR Code SVG na tela
   ✅ Opção para gerar novo

# 5. Escaneie com seu telefone e faça o PIX
   (Se quiser testar, pode desistir)
```

### 2️⃣ Com Ngrok (Teste Completo com Webhook)

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Ngrok
ngrok http 3000
# Copie a URL gerada (exemplo: https://abc123.ngrok.io)

# 3. Configurar webhook no Mercado Pago:
#    https://www.mercadopago.com.br/developers/panel
#    Webhooks > Add URL
#    https://abc123.ngrok.io/api/payment/webhook

# 4. Fazer pagamento:
#    http://localhost:3000/payment/mercadopago
#    Clique "PIX / QR Code"
#    Gere QR Code
#    Escaneie e pague

# 5. Verificar resultados:
#    - Console do servidor (deve aparecer webhook)
#    - Banco de dados (status = approved)
#    - Campo planActivatedAt foi preenchido
#    - Campo plan foi atualizado
```

---

## 📊 O Que Você Deve Ver

### Após gerar QR Code:

**No Navegador:**
```
✅ QR Code SVG renderizado
✅ Botão "Gerar novo QR Code"
✅ Mensagem "Aguardando confirmação do pagamento..."
```

**No Console do Servidor (npm run dev):**
```
Webhook do Mercado Pago recebido: {
  type: 'payment',
  data: { id: 12345678 },
  ...
}
Detalhes do pagamento do MP: {
  id: 12345678,
  status: 'approved',
  external_reference: 'uuid-do-pagamento',
  ...
}
Pagamento atualizado: {
  id: 'uuid-do-pagamento',
  novoStatus: 'approved'
}
✅ Plano ativado automaticamente para usuário: {
  userId: 'uuid-do-user',
  plan: 'intermediario' ou 'avancado',
  timestamp: '2026-01-17T...'
}
```

**No Banco de Dados:**
```sql
SELECT * FROM payment_requests 
WHERE id = 'uuid-do-pagamento';
-- Deve mostrar:
-- status: 'approved'
-- mercadoPagoPaymentId: '12345678'
-- mercadoPagoQrCodeData: 'svg-data...'

SELECT * FROM users 
WHERE id = 'uuid-do-user';
-- Deve mostrar:
-- plan: 'intermediario' ou 'avancado'
-- planActivatedAt: 2026-01-17 ...
```

### Após escanear e pagar (com webhook):

**No Navegador:**
```
✅ (depois de ~3-5 segundos)
✅ Pagamento Confirmado!
Seu pagamento foi processado com sucesso.
```

**E o usuário terá acesso ao plano instantaneamente!** 🎉

---

## 🔍 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| QR Code não aparece | Verifique console (F12), veja TROUBLESHOOTING.md |
| Campo planActivatedAt não existe | Execute migração (veja acima) |
| Webhook não recebe notificação | Configure Ngrok, veja TESTE_PIX.md |
| Plano não ativa | Verifique logs do servidor, status = approved? |
| Banco de dados com erro | Verifique conexão, credenciais, migração |

---

## 📚 Documentação Relacionada

Leia em ordem:

1. **[MUDANCAS_REALIZADAS.md](./MUDANCAS_REALIZADAS.md)** - O que foi alterado
2. **[MERCADO_PAGO_TESTE_PIX.md](./MERCADO_PAGO_TESTE_PIX.md)** - Como testar PIX
3. **[MERCADO_PAGO_TROUBLESHOOTING.md](./MERCADO_PAGO_TROUBLESHOOTING.md)** - Resolver problemas

---

## 🎯 Resumo Rápido

```
1. Migração no banco (adicionar planActivatedAt)
   npm run typeorm migration:run

2. Reiniciar servidor
   npm run dev

3. Abrir http://localhost:3000/payment/mercadopago

4. Testar PIX (com ou sem Ngrok)

5. Verificar:
   - QR Code aparece
   - Status atualiza (se com webhook)
   - Plano ativa (se com webhook)
   - planActivatedAt é preenchido

6. Pronto! 🎉
```

---

## 💰 Valores para Teste

**Lembre-se:** Os valores são REAIS mas muito pequenos!

| Plano | Valor | Equivalente |
|-------|-------|-------------|
| Intermediário | R$ 0,01 | 1 centavo |
| Avançado | R$ 0,02 | 2 centavos |

Você consegue testar a integração completa gastando menos do que uma garrafa de água! 💧

---

## 🚀 Próximas Fases (Após Testes)

**Fase 2: Implementações Opcionais**
- [ ] Enviar email de confirmação de pagamento
- [ ] Enviar recibo em PDF
- [ ] Dashboard de transações
- [ ] Histórico de pagamentos

**Fase 3: Migração para Produção**
- [ ] Obter credenciais PRODUÇÃO
- [ ] Atualizar variáveis de ambiente
- [ ] Configurar webhook em PROD
- [ ] HTTPS ativado
- [ ] Testes finais

---

**Data:** 17 de Janeiro de 2026
**Status:** ✅ Pronto para Migração e Testes

👉 **Próximo passo:** Execute a migração no banco de dados!
