# 🧪 Como Testar PIX com Mercado Pago (Real)

## 📱 Teste em Desenvolvimento

### Pré-requisitos
- ✅ Credenciais de TESTE do Mercado Pago (já configuradas)
- ✅ Servidor rodando: `npm run dev`
- ✅ Banco de dados sincronizado

---

## 🚀 Teste PIX Step by Step

### 1️⃣ Abrir a Página de Checkout

```
http://localhost:3000/payment/mercadopago
```

### 2️⃣ Selecionar PIX

- Clique em **"PIX / QR Code"**

### 3️⃣ Gerar QR Code

- Clique em **"Gerar QR Code"**
- Você verá um **QR Code SVG** aparecendo na tela

### 4️⃣ Escanear e Pagar (Real)

**Opção A: Com telefone real**
- Abra o app do seu banco (ou Mercado Pago)
- Escaneie o QR Code
- Faça o PIX normalmente
- O pagamento será processado em tempo real!

**Opção B: Sem telefone (simulação)**
- Usar Ngrok para simular webhook (ver abaixo)
- Enviar notificação manual

---

## 🔔 Webhook em Desenvolvimento (Ngrok)

Se quiser testar o webhook automaticamente em desenvolvimento:

### 1. Instalar Ngrok
```bash
# Baixar de: https://ngrok.com/download
# Ou via chocolatey (Windows):
choco install ngrok

# Ou via scoop (Windows):
scoop install ngrok
```

### 2. Expor Localhost
```bash
# Em novo terminal:
ngrok http 3000

# Copiar a URL gerada (exemplo):
# https://abc123.ngrok.io
```

### 3. Configurar Webhook no Mercado Pago

**Ir para:** https://www.mercadopago.com.br/developers/panel

**Passos:**
1. Account Settings (engrenagem no canto superior direito)
2. Webhooks
3. Clique em "Add notification URL"
4. Cole sua URL Ngrok:
   ```
   https://abc123.ngrok.io/api/payment/webhook
   ```
5. Selecione os eventos:
   - ☑️ `payment.created`
   - ☑️ `payment.updated`
   - ☑️ `merchant_order.updated`
6. Clique em "Save"

### 4. Testar Webhook Manual

```bash
# No terminal, testar se webhook funciona:
curl -X POST https://abc123.ngrok.io/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {"id": 12345678}
  }'
```

---

## 💰 Valores de Teste

Agora os preços estão configurados para teste:

| Plano | Valor |
|-------|-------|
| Intermediário | R$ 0,01 |
| Avançado | R$ 0,02 |

**Ótimo para testes!** Você consegue fazer PIX real gastando apenas centavos.

---

## ✅ O Que Deve Acontecer

### Fluxo Completo (PIX)

```
1. Gera QR Code
   ✅ QR Code aparece na tela
   ✅ Console mostra: "QR Code PIX gerado com sucesso"
   
2. Escaneia e Paga
   ✅ Faz PIX via banco/app
   ✅ Transação processada pelo Mercado Pago
   
3. Webhook Notifica (automático)
   ✅ Mercado Pago envia notificação
   ✅ Status atualizado no BD
   
4. Plano Ativado Automaticamente
   ✅ Campo "plan" do usuário é atualizado
   ✅ Usuário tem acesso ao plano
   ✅ SEM necessidade de aprovação manual!

5. Interface Atualiza
   ✅ Mostra ✅ Pagamento Confirmado
   ✅ Redireciona ou atualiza dashboard
```

---

## 🔍 Monitorando em Tempo Real

### Verifique os Logs

**Terminal do servidor:**
```
Webhook do Mercado Pago recebido: {...}
Detalhes do pagamento do MP: {...}
Pagamento atualizado: {...}
✅ Plano ativado automaticamente para usuário: {...}
```

### Verifique no Console do Navegador (F12)

```javascript
// Deve aparecer mensagens:
"QR Code PIX gerado com sucesso!"
"Pagamento aprovado!"
// Ou para pendente:
"Aguardando confirmação..."
```

### Verifique no Banco de Dados

```sql
-- Verificar pagamento criado
SELECT * FROM payment_requests 
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar plano do usuário
SELECT id, email, plan, planActivatedAt 
FROM users 
WHERE id = 'seu-uuid-aqui';
```

---

## 🎯 Teste Completo: PIX Real

### Cenário 1: PIX com Webhook Automático

```
VOCÊ                          SEU SERVIDOR              MERCADO PAGO
  │                                  │                        │
  ├─ Acessa checkout ────────────────>│                       │
  │                                  │                        │
  ├─ Clica "Gerar QR Code"────────────>│                       │
  │                                  ├─ POST /v1/qr ────────>│
  │                                  │<─ QR Code ────────────┤
  │<─ Vê QR Code na tela ─────────────┤                       │
  │                                  │                        │
  ├─ Escaneia com telefone           │                        │
  │  (seu banco/app)                 │                        │
  │                                  │                        │
  ├─ Faz PIX (seu banco) ────────────────────────────────────>│
  │  (transação real!)               │                        │
  │                                  │                        │
  │                                  │<─ Webhook notify ─────┤
  │                                  │  (payment.updated)     │
  │                                  │                        │
  │                                  ├─ Atualiza BD           │
  │                                  ├─ Ativa plano user     │
  │                                  │                        │
  │<─ ✅ Pagamento Confirmado ────────┤                       │
  │   (automático!)                  │                        │
```

---

## 🔧 Troubleshooting PIX

### Problema: QR Code não aparece

**Solução:**
1. Abra DevTools (F12)
2. Verifique Console para erros
3. Verifique se SDK do Mercado Pago carregou
4. Veja: MERCADO_PAGO_TROUBLESHOOTING.md

### Problema: Webhook não recebe notificação

**Solução:**
1. Verifique Ngrok URL no painel MP
2. Teste webhook manual (curl acima)
3. Verificar logs do servidor
4. Veja: MERCADO_PAGO_TROUBLESHOOTING.md

### Problema: Plano não ativa automaticamente

**Solução:**
1. Verifique logs do webhook (deve aparecer ✅)
2. Verifique se status = "approved"
3. Verifique BD se plan foi atualizado
4. Verifique em componentes se plan foi recarregado

---

## 💡 Dicas Importantes

✅ **Use valores reais (centavos)**
- R$ 0,01 e R$ 0,02 são valores reais
- Você gastará apenas alguns centavos em testes
- Muito melhor do que R$ 49,90!

✅ **Webhook é necessário para PIX**
- Cartão: pode aprovar instantaneamente
- PIX: precisa de webhook para confirmar
- Configure Ngrok se testar webhook em dev

✅ **Lembre que é TESTE**
- Credenciais começam com "TEST-"
- Não saca o dinheiro de verdade
- Dados são apenas para teste

✅ **Monitorar logs**
- Terminal do servidor
- Console do navegador (F12)
- Banco de dados

---

## 📊 Checklist de Teste

```markdown
Antes de considerar "pronto":

PIX:
- [ ] QR Code aparece ao gerar
- [ ] QR Code pode ser escaneado
- [ ] PIX pode ser feito (real ou Ngrok)
- [ ] Webhook recebe notificação
- [ ] Status muda para "approved"
- [ ] Plano do usuário é atualizado automaticamente
- [ ] Sem popup de "aprovação pendente"

Cartão (opcional):
- [ ] Formulário valida dados
- [ ] Cartão de teste APROVADO funciona
- [ ] Cartão de teste RECUSADO é rejeitado

Automação:
- [ ] Plano ativa sem admin aprovar
- [ ] Email é enviado (se implementado)
- [ ] Dashboard atualiza automaticamente
```

---

## 🚀 Próximas Etapas

1. **Testar PIX** seguindo este guia
2. **Configurar Ngrok** para webhook
3. **Fazer pagamento real** (centavos!)
4. **Verificar plano ativa automaticamente**
5. **Implementar email de confirmação** (opcional)
6. **Deploy em produção** quando pronto

---

## 📞 Suporte

Se encontrar problemas:
1. Consulte MERCADO_PAGO_TROUBLESHOOTING.md
2. Verifique logs do servidor
3. Verifique console do navegador
4. Veja painel do Mercado Pago

---

**Criado em:** 17 de Janeiro de 2026 ✨
**Preços atualizados:** 0.01 e 0.02
**Ativação de plano:** Automática ✅
