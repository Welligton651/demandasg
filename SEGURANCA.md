# TransportHub – checklist de segurança antes de abrir ao público

O login atual (usuário + senha em base64) roda só no navegador e **não protege os dados**.
A proteção real precisa estar nas regras do Firestore.

## 1. Projeto Firebase próprio
O projeto atual (`controle-de-estoque-65575`) parece servir outro sistema. Crie um projeto
novo para o TransportHub e troque o `firebaseConfig` no `index.html` pelos valores reais
(Configurações do projeto → Seus apps → Config).

## 2. Firebase Authentication
- Ative **E-mail/senha** e crie os 3 usuários administradores.
- Ative **Anônimo** (usado pelos visitantes).
- Troque `entrarComoAdmin()` por `signInWithEmailAndPassword` e `entrarComoVisitante()` por
  `signInAnonymously()` (inclua o script `firebase-auth.js` v8.10.0).

## 3. Regras do Firestore (modelo)
Substitua os e-mails pelos reais dos administradores.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email in [
          'joyce@exemplo.com', 'welligton@exemplo.com', 'marcio@exemplo.com'
        ];
    }
    function logado() { return request.auth != null; }

    match /demandas/{id}   { allow read: if logado(); allow write: if isAdmin(); }
    match /motoristas/{id} { allow read: if logado(); allow write: if isAdmin(); }
    match /ferias/{id}     { allow read, write: if isAdmin(); }
    match /auditoria_visitantes/{id} {
      allow read: if isAdmin();
      allow create, update: if logado();
    }
  }
}
```

Observação: o sistema atual permite que visitantes (leitura) criem sessões de auditoria, por
isso `create/update` ficam liberados para qualquer logado nessa coleção.

## 4. Demais cuidados
- Restrinja a API key ao domínio de hospedagem (Google Cloud → Credenciais).
- Hospede a imagem de fundo do login junto com o site (hoje vem de i.ibb.co).
- Avise na tela de login que IP e dispositivo dos visitantes são registrados (LGPD).
