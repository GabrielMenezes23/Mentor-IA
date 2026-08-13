# Mentor IA

Página de login para liberar o widget do Mentor IA após a autenticação.

## Deploy na Vercel

1. Importe o repositório `GabrielMenezes23/Mentor-IA` na Vercel.
2. Não é necessário configurar build command nem output directory.
3. Em **Settings > Environment Variables**, adicione:
   - `MENTOR_USERNAME` = seu usuário de acesso
   - `MENTOR_PASSWORD` = sua senha de acesso
   - `MENTOR_SESSION_SECRET` = uma sequência aleatória longa
4. Publique o projeto.

O widget só é carregado depois que o login é validado. A validação acontece nas funções serverless da Vercel; as credenciais não ficam no repositório público.
