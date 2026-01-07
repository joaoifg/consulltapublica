# Como Adicionar as Minutas ao Sistema

## 📄 Arquivos Necessários

Para que a funcionalidade de consulta de minutas funcione completamente, você precisa:

1. **Arquivo DOCX original** - Já copiado para `frontend/public/minutas/CPEO.docx`
2. **Arquivo PDF** - Precisa ser gerado a partir do DOCX

## 🔄 Converter DOCX para PDF

### Opção 1: Microsoft Word
1. Abra o arquivo `CPEO.docx` no Microsoft Word
2. Vá em **Arquivo** > **Salvar Como** ou **Exportar**
3. Escolha formato **PDF**
4. Salve como `CPEO.pdf` na pasta `frontend/public/minutas/`

### Opção 2: LibreOffice (Gratuito)
1. Abra o arquivo no LibreOffice Writer
2. Vá em **Arquivo** > **Exportar como PDF**
3. Salve como `CPEO.pdf` na pasta `frontend/public/minutas/`

### Opção 3: Online (Recomendado para teste rápido)
1. Acesse: https://www.ilovepdf.com/docx_to_pdf
2. Faça upload do arquivo `CPEO.docx`
3. Baixe o PDF gerado
4. Renomeie para `CPEO.pdf` e coloque em `frontend/public/minutas/`

## 📁 Estrutura de Arquivos

Após adicionar os arquivos, a estrutura deve ficar assim:

```
frontend/public/minutas/
├── CPEO.docx          ✅ (já copiado)
├── CPEO.pdf           ⏳ (precisa criar)
├── CEO.docx           ⏳ (se tiver)
├── CEO.pdf            ⏳ (se tiver)
└── README.md          ✅
```

## ✅ Funcionalidades Implementadas

1. **Página de Consulta** (`/minuta?documento=CPEO`)
   - Visualização do PDF em iframe
   - Download do PDF
   - Download do DOCX original
   - Link para enviar contribuição

2. **Links na Página Inicial**
   - Botões para consultar minuta CEO
   - Botões para consultar minuta CPEO

3. **Navegação**
   - Fácil alternância entre documentos
   - Link para voltar ao início
   - Link direto para contribuir

## 🎯 Como Usar

1. **Usuário acessa a página inicial**
2. **Clica em "Consultar Minuta CPEO" ou "Consultar Minuta CEO"**
3. **Visualiza o documento** diretamente no navegador
4. **Pode baixar** o PDF ou DOCX se preferir
5. **Clica em "Enviar Contribuição"** para começar o processo

## 🔧 Próximos Passos

1. ✅ Página de consulta criada
2. ✅ Links adicionados na página inicial
3. ⏳ Converter DOCX para PDF
4. ⏳ Adicionar minuta do CEO (se disponível)
5. ⏳ Testar visualização no navegador

## 📝 Notas

- O visualizador de PDF usa iframe, que funciona na maioria dos navegadores modernos
- Se o PDF não abrir no iframe, o usuário pode baixar o arquivo
- Os arquivos ficam na pasta `public`, então são servidos estaticamente pelo Next.js




