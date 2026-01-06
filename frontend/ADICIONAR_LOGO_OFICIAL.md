# Como Adicionar a Logo Oficial do CFO

## Preparação da Imagem

### 1. Salvar a Logo

Salve a logo oficial do CFO em dois formatos:

**Logo Horizontal** (para header principal):
- Arquivo: `cfo-logo-horizontal.png` ou `.svg`
- Dimensões recomendadas: 400x100px (ou proporcionalmente maior)
- Fundo: Transparente

**Brasão da República** (opcional):
- Arquivo: `brasao-republica.png` ou `.svg`
- Dimensões: 80x80px

### 2. Colocar no Projeto

Coloque as imagens na pasta:
```
frontend/public/images/
  ├── cfo-logo-horizontal.png
  ├── cfo-logo-horizontal.svg  (preferível)
  └── brasao-republica.png
```

## Atualizar o Header Principal

### Opção 1: Logo Completa (Recomendado)

Edite `frontend/src/app/page.tsx`:

```tsx
// Substitua o SVG simplificado por:
<div className="flex items-center space-x-4">
  <img
    src="/images/cfo-logo-horizontal.svg"
    alt="Conselho Federal de Odontologia"
    className="h-16 w-auto"
  />
  <div>
    <h1 className="text-2xl md:text-3xl font-bold">Conselho Federal de Odontologia</h1>
    <p className="text-cfo-100 text-sm md:text-base mt-1">Sistema de Consulta Pública</p>
  </div>
</div>
```

### Opção 2: Logo + Brasão

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-4">
    {/* Logo CFO */}
    <img
      src="/images/cfo-logo-horizontal.svg"
      alt="CFO"
      className="h-16 w-auto"
    />
    <div className="hidden md:block">
      <h1 className="text-2xl font-bold">Conselho Federal de Odontologia</h1>
      <p className="text-cfo-100 text-sm">Sistema de Consulta Pública</p>
    </div>
  </div>

  {/* Brasão da República */}
  <img
    src="/images/brasao-republica.png"
    alt="República Federativa do Brasil"
    className="h-16 w-auto hidden lg:block"
  />
</div>
```

### Opção 3: Layout Completo (Como site oficial)

```tsx
<header className="bg-white shadow-md">
  {/* Barra Superior Vermelha */}
  <div className="bg-cfo-900 text-white py-2">
    <div className="container mx-auto px-4 flex justify-between text-sm">
      <div className="flex items-center space-x-4">
        <span>📍 Brasília - DF</span>
        <span>📞 0800 000 4499</span>
        <span>✉️ ouvidoria@cfo.org.br</span>
      </div>
      <div className="hidden md:flex space-x-3">
        <a href="#" className="hover:underline">Acesso à Informação</a>
        <a href="#" className="hover:underline">Portal CFO</a>
      </div>
    </div>
  </div>

  {/* Header Principal */}
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* Logo CFO */}
      <img
        src="/images/cfo-logo-horizontal.svg"
        alt="Conselho Federal de Odontologia"
        className="h-20 w-auto"
      />

      {/* Título Central */}
      <div className="text-center flex-1 px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Sistema de Consulta Pública
        </h1>
        <p className="text-gray-600 text-sm">
          Códigos de Ética e Processo Ético Odontológico
        </p>
      </div>

      {/* Brasão */}
      <img
        src="/images/brasao-republica.png"
        alt="República Federativa do Brasil"
        className="h-20 w-auto hidden lg:block"
      />
    </div>
  </div>
</header>
```

## Componente Reutilizável

Crie `frontend/src/components/LogoCFO.tsx`:

```tsx
interface LogoCFOProps {
  variant?: 'horizontal' | 'compact' | 'icon'
  className?: string
}

export default function LogoCFO({ variant = 'horizontal', className = '' }: LogoCFOProps) {
  if (variant === 'horizontal') {
    return (
      <img
        src="/images/cfo-logo-horizontal.svg"
        alt="Conselho Federal de Odontologia"
        className={`h-16 w-auto ${className}`}
      />
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <img
          src="/images/cfo-logo-icon.svg"
          alt="CFO"
          className={`h-12 w-12 ${className}`}
        />
        <div>
          <div className="font-bold text-lg">CFO</div>
          <div className="text-xs text-gray-600">Conselho Federal</div>
        </div>
      </div>
    )
  }

  // Icon only
  return (
    <img
      src="/images/cfo-logo-icon.svg"
      alt="CFO"
      className={`h-12 w-12 ${className}`}
    />
  )
}
```

Uso:
```tsx
import LogoCFO from '@/components/LogoCFO'

<LogoCFO variant="horizontal" />
```

## Otimização de Imagens

### SVG (Preferencial)

**Vantagens**:
- Escalável sem perda de qualidade
- Tamanho de arquivo pequeno
- Pode mudar cores via CSS

**Como converter PNG para SVG**:
1. Use https://convertio.co/pt/png-svg/
2. Ou Adobe Illustrator / Inkscape
3. Otimize com https://jakearchibald.github.io/svgomg/

### PNG

**Se usar PNG**:
- Use PNG-24 com transparência
- Otimize com https://tinypng.com/
- Crie versões 1x, 2x, 3x para diferentes resoluções

```tsx
<img
  src="/images/cfo-logo.png"
  srcSet="
    /images/cfo-logo.png 1x,
    /images/cfo-logo@2x.png 2x,
    /images/cfo-logo@3x.png 3x
  "
  alt="CFO"
/>
```

## Next.js Image Component (Otimizado)

Para melhor performance, use o componente Image do Next.js:

```tsx
import Image from 'next/image'

<Image
  src="/images/cfo-logo-horizontal.svg"
  alt="Conselho Federal de Odontologia"
  width={400}
  height={100}
  priority // Para logo principal
  className="h-auto w-auto"
/>
```

## Favicon

Não esqueça de adicionar o favicon do CFO:

1. Crie `frontend/public/favicon.ico` (16x16, 32x32, 64x64)
2. Adicione em `frontend/src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: 'Consulta Pública CFO',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
}
```

## Cores Oficiais Atualizadas

Já configurado no `tailwind.config.ts`:

```css
cfo-900: #8D0F12  /* Vermelho bordô oficial */
```

Use:
```tsx
className="bg-cfo-900 text-white"
```

## Checklist Final

- [ ] Logo horizontal salva em `public/images/`
- [ ] Formato SVG ou PNG otimizado
- [ ] Header atualizado com logo real
- [ ] Favicon adicionado
- [ ] Brasão da república (opcional)
- [ ] Testado em diferentes tamanhos de tela
- [ ] Performance verificada

## Exemplo Completo

Arquivo: `frontend/src/app/page.tsx`

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Vermelha Superior */}
      <div className="bg-cfo-900 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between">
          <div className="flex gap-4">
            <span>📍 Brasília - DF</span>
            <span>📞 0800 000 4499</span>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo CFO Real */}
            <img
              src="/images/cfo-logo-horizontal.svg"
              alt="Conselho Federal de Odontologia"
              className="h-16 w-auto"
            />

            {/* Título */}
            <div className="text-center flex-1 px-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Sistema de Consulta Pública
              </h1>
            </div>

            {/* Brasão (opcional) */}
            <img
              src="/images/brasao-republica.png"
              alt="República Federativa do Brasil"
              className="h-16 w-auto hidden lg:block"
            />
          </div>
        </div>
      </header>

      {/* Resto do conteúdo */}
    </div>
  )
}
```

## Resultado Esperado

O header ficará **exatamente como no site oficial do CFO**:
- Logo CFO à esquerda
- Título centralizado
- Brasão da República à direita
- Cores oficiais (#8D0F12)
- Layout profissional e institucional

---

**Nota**: As logos e imagens devem ser fornecidas pelo CFO ou baixadas do site oficial com autorização.
