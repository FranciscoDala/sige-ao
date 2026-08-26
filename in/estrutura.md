$root = "sige-ao"

$folders = @(
"apps/api/app/api","apps/api/app/core","apps/api/app/db","apps/api/app/models","apps/api/app/schemas","apps/api/app/services","apps/api/app/integrations","apps/api/tests",
"apps/web/src/components","apps/web/src/pages","apps/web/src/app","apps/web/src/api","apps/web/public",
"apps/site-escola/src/app","apps/site-escola/src/components", # site público de cada escola
"packages/ui","packages/tsconfig","packages/eslint-config","packages/db",
"infra","docs",".github/workflows"
)

$files = @(
"apps/api/app/main.py","apps/api/app/__init__.py",
"apps/api/app/api/v1_auth.py","apps/api/app/api/v1_escola.py","apps/api/app/api/v1_aluno.py","apps/api/app/api/v1_professor.py","apps/api/app/api/v1_turma.py","apps/api/app/api/v1_nota.py",
"apps/api/app/core/config.py","apps/api/app/core/security.py","apps/api/app/db/session.py","apps/api/app/db/base.py",
"apps/api/app/models/escola.py","apps/api/app/models/usuario.py","apps/api/app/models/aluno.py","apps/api/app/models/professor.py","apps/api/app/models/turma.py","apps/api/app/models/nota.py",
"apps/api/app/schemas/escola_schema.py","apps/api/app/schemas/usuario_schema.py","apps/api/app/schemas/aluno_schema.py",
"apps/api/app/services/escola_service.py","apps/api/app/services/auth_service.py",
"apps/api/app/integrations/email.py","apps/api/tests/test_auth.py","apps/api/alembic.ini","apps/api/Dockerfile","apps/api/pyproject.toml",
"apps/web/src/main.tsx","apps/web/src/app/layout.tsx","apps/web/src/app/login/page.tsx","apps/web/src/app/dashboard/page.tsx","apps/web/src/components/Header.tsx","apps/web/src/api/client.ts",
"apps/web/package.json","apps/web/next.config.js",
"apps/site-escola/src/app/[slug]/page.tsx","apps/site-escola/src/app/[slug]/layout.tsx","apps/site-escola/package.json", # [slug] pega mutamba.sige-ao.ao
"packages/ui/index.ts","packages/tsconfig/base.json","packages/eslint-config/index.js","packages/db/index.ts",
"infra/docker-compose.yml","infra/render.yaml",
"docs/API.md","docs/ONBOARDING.md",".github/workflows/deploy.yml",".gitignore","package.json","pnpm-workspace.yaml","README.md",".env.example"
)

# Criar pastas
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path "$root/$folder" | Out-Null
}

# Criar arquivos vazios
foreach ($file in $files) {
    New-Item -ItemType File -Force -Path "$root/$file" | Out-Null
}

Write-Host "Estrutura do SIGE-AO criada com sucesso em ./$root"
