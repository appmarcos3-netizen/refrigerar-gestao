# REGRIGERAR — sistema online

Este pacote contém a primeira versão web do sistema, com identidade visual azul/branco e a logo fornecida.

## O que já está preparado
- Login por e-mail e senha (Supabase Auth).
- Cadastro e exclusão de clientes.
- Criação e histórico de orçamentos.
- Cálculo automático do total.
- Impressão/salvamento do orçamento em PDF pelo navegador.
- Compartilhamento do orçamento pelo WhatsApp (abre uma conversa com texto preenchido).
- Registro básico de receitas e despesas.
- Banco de dados com políticas RLS para separar os dados por usuário.

## Importante
O pacote ainda **não está publicado na internet** e não tem banco conectado. Para funcionar online, você precisará criar as contas gratuitas do Supabase e Vercel e inserir as configurações no projeto. Não compartilhe sua senha com ninguém. A chave `anon/public` do Supabase pode ficar no navegador quando as políticas RLS estiverem corretamente configuradas; nunca coloque a `service_role` no site.

## Etapa 1 — criar o banco Supabase
1. Acesse https://supabase.com e crie uma conta.
2. Crie um projeto (guarde a senha do banco em local seguro).
3. No painel do projeto, abra **SQL Editor**.
4. Abra o arquivo `supabase/schema.sql`, copie todo o conteúdo e execute no SQL Editor.
5. Vá em **Project Settings → API** e copie:
   - Project URL
   - anon / publishable public key (não use service_role/secret key).
6. Abra `app.js` e substitua:
   - `COLE_A_URL_DO_SUPABASE` pela Project URL.
   - `COLE_A_CHAVE_ANON_PUBLICA` pela chave pública anon/publishable.

## Etapa 2 — criar o usuário de acesso
1. No Supabase, abra **Authentication → Users**.
2. Escolha **Add user / Create new user**.
3. Informe seu e-mail e crie uma senha forte.
4. Se houver opção de confirmação de e-mail, confirme o usuário conforme a configuração do projeto.

## Etapa 3 — publicar na Vercel
1. Acesse https://vercel.com e crie uma conta.
2. Crie um repositório no GitHub e envie os arquivos desta pasta para ele, ou use a opção de importar projeto disponível na Vercel.
3. Importe o repositório na Vercel. Como é um site estático, não precisa de comando de build; a pasta raiz é a própria raiz do projeto.
4. Conclua o deploy. A Vercel fornecerá um endereço `*.vercel.app`.

## Teste antes de usar com clientes
- Entre com o usuário criado.
- Cadastre um cliente de teste.
- Faça um orçamento de teste e confira o PDF.
- Teste o botão WhatsApp.
- Verifique se um usuário não autenticado não consegue ler dados (as tabelas têm RLS habilitado).

## Limitações desta primeira versão
- É uma base inicial: ainda não possui edição de registros, contas a pagar/receber com vencimento, relatórios mensais, emissão fiscal ou integração oficial com WhatsApp Business API.
- O botão WhatsApp usa link `wa.me` e depende do WhatsApp instalado/aberto no aparelho.
- O PDF é gerado pela função de impressão do navegador; escolha “Salvar como PDF”.
- O projeto gratuito das plataformas pode ter limites e regras que mudam com o tempo.
- Antes de cadastrar dados reais de clientes, teste o sistema e mantenha cópias de segurança.
