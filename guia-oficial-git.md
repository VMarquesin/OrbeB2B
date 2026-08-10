# Guia Oficial Git: Mantendo o Histórico Linear (Zero Merges)

**Objetivo:** Este documento define o fluxo de trabalho obrigatório para versionamento. O nosso repositório utiliza uma **linha do tempo contínua e linear**.

É expressamente proibido o uso de `git merge` entre branches de trabalho e a `main`. A atualização do código deve ser feita **EXCLUSIVAMENTE via `git rebase`**.

Se você tiver dúvidas durante o processo, copie este documento e cole no ChatGPT/Claude/Copilot/Gemini junto com o erro que apareceu no seu terminal.

---

## Passo a Passo do Fluxo de Trabalho

## Antes de iniciar o processo atualize a Main

```bash
git checkout main
git fetch
git pull
```

### 1. Criar sua Branch de Trabalho

Sempre parta da branch `main` atualizada.

```bash
git checkout main
git pull
git checkout -b <nome-da-sua-branch>
```

> **Nota:** O parâmetro `-b` cria a branch e já muda para ela.

### 2. Salvar suas Alterações (Commit)

Faça o seu código, teste e adicione os arquivos na aba **Source Control** do seu editor (VS Code). Em seguida, faça o commit das alterações:

```bash
git commit -m "feat: descricao clara do que foi feito"
```

### 3. Enviar para o Servidor (Backup)

No primeiro envio da sua branch, você precisa "linká-la" com o repositório remoto:

```bash
git push -u origin <nome-da-sua-branch>
```

> **Nota:** Nos próximos envios, basta digitar apenas `git push`.

---

## A Regra de Ouro: O Rebase (Antes de abrir o Pull Request)

Antes de abrir o Pull Request, você **precisa** garantir que a sua branch possui o código mais recente que outros desenvolvedores possam ter enviado para a `main`.

**NUNCA use `git merge main`.**

Siga os passos abaixo para fazer o **Rebase** e colocar seus commits no topo da linha do tempo.

### 4. Atualizar a Main Local

```bash
git checkout main
git fetch
git pull
```

### 5. Aplicar o Rebase na sua Branch

```bash
git checkout <nome-da-sua-branch>
git rebase main
```

### 6. Resolver Conflitos (Apenas se o terminal avisar)

Se o Git pausar o rebase avisando sobre **CONFLITOS**:

1. Abra os arquivos marcados em vermelho no VS Code.
2. Escolha qual código deve permanecer (**Current Change** vs **Incoming Change**).
3. Salve os arquivos.
4. Adicione os arquivos resolvidos no **Source Control** ou via:

```bash
git add .
```

5. Continue o processo rodando:

```bash
git rebase --continue
```

> **Importante:** Repita o processo até o terminal avisar que o rebase foi concluído com sucesso. Nunca rode `git commit` durante a resolução de um rebase.

### 7. Forçar a Atualização no Servidor (Push Seguro)

Como o `rebase` reescreve o histórico da sua branch, o `git push` normal será rejeitado. Você deve usar o envio forçado seguro:

```bash
git push --force-with-lease
```

> **Importante:** Nunca use apenas `--force`. O `--force-with-lease` ajuda a evitar que você apague acidentalmente o trabalho de outro colega.

---

## 8. Finalização

Após executar:

```bash
git push --force-with-lease
```

Vá até o GitHub/GitLab e abra o seu **Pull Request**.

O histórico estará em uma linha reta perfeita, pronto para revisão.
