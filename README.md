# Gerir Dieta 🍎

Aplicação moderna para gerenciar sua dieta, alimentos, refeições e acompanhar seus macros nutricionais diários.

## Funcionalidades

- 📅 **Diário**: Adicione o que você comeu e use IA (Google Gemini) para estimar automaticamente os macros nutricionais
- 🍎 **Alimentos**: Crie e gerencie seus alimentos personalizados com valores nutricionais
- 🍽️ **Refeições**: Combine vários alimentos para criar refeições completas
- 📊 **Acompanhamento**: Visualize o total de macros do dia (calorias, proteínas, carboidratos, gorduras)

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini (IA para estimar macros)

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure a chave do Google Gemini em `.env.local` (grátis em [Google AI Studio](https://aistudio.google.com/apikey)):

```bash
GEMINI_API_KEY=sua-chave-gemini
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Como Usar

1. **Estimador de Macros**: Na aba "Diário", digite o que você comeu (ex: "1 prato de arroz com feijão e frango grelhado") e clique em "Estimar" para obter os macros automaticamente via IA.

2. **Criar Alimentos**: Na aba "Alimentos", crie alimentos personalizados com seus valores nutricionais. Você pode usar o botão "Estimar macros com IA" para preencher automaticamente.

3. **Criar Refeições**: Na aba "Refeições", combine vários alimentos para criar refeições completas. Os macros são calculados automaticamente.

4. **Adicionar ao Diário**: Você pode adicionar alimentos ou refeições criadas ao seu diário do dia, especificando a quantidade.

Todos os dados são armazenados localmente no navegador (localStorage).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
