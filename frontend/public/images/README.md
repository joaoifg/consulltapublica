# Pasta de Imagens do CFO

## Arquivos Necessários

Coloque nesta pasta as logos oficiais do CFO:

### Logo Principal
- **Arquivo**: `cfo-logo-horizontal.svg` (preferencial) ou `.png`
- **Descrição**: Logo completa com texto "CONSELHO FEDERAL DE ODONTOLOGIA"
- **Uso**: Header principal do site
- **Dimensões recomendadas**: 400x100px (SVG é escalável)

### Ícone CFO
- **Arquivo**: `cfo-logo-icon.svg` ou `.png`
- **Descrição**: Apenas a parte "cfo" estilizada
- **Uso**: Favicon, ícone pequeno
- **Dimensões**: 64x64px

### Brasão da República (Opcional)
- **Arquivo**: `brasao-republica.png` ou `.svg`
- **Descrição**: Brasão oficial da República Federativa do Brasil
- **Uso**: Header (lado direito)
- **Dimensões**: 80x80px

## Como Obter as Logos

1. **Site Oficial CFO**: https://cfo.org.br
2. **Baixar imagens** do header do site
3. **Converter para SVG** (se necessário): https://convertio.co/pt/png-svg/
4. **Otimizar SVG**: https://jakearchibald.github.io/svgomg/

## Formato dos Arquivos

Estrutura esperada:
```
frontend/public/images/
├── cfo-logo-horizontal.svg  ← Logo principal (PRIORITÁRIO)
├── cfo-logo-icon.svg        ← Ícone pequeno
├── brasao-republica.png     ← Brasão (opcional)
└── README.md               ← Este arquivo
```

## Cores Oficiais

- **Vermelho Bordô**: `#8D0F12` (já configurado no Tailwind)

## Próximos Passos

Após adicionar as logos:
1. Verifique se os arquivos estão acessíveis em `/images/cfo-logo-horizontal.svg`
2. Siga as instruções em `frontend/ADICIONAR_LOGO_OFICIAL.md`
3. Atualize o componente header em `src/app/page.tsx`

## Licença e Direitos

As logos do CFO são propriedade do Conselho Federal de Odontologia.
Uso restrito para este sistema institucional.

---

**Última atualização**: Janeiro 2026
