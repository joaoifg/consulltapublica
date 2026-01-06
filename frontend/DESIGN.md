# Design System - CFO Consulta Pública

## Paleta de Cores

### Cores Principais (CFO)

Baseadas na identidade visual oficial do Conselho Federal de Odontologia:

```css
cfo-50:  #fef2f3  /* Rosa muito claro - fundos sutis */
cfo-100: #fde6e7  /* Rosa claro - textos secundários */
cfo-200: #fbd0d5  /* Rosa suave */
cfo-300: #f7aab2  /* Rosa médio */
cfo-400: #f27a8a  /* Rosa vibrante */
cfo-500: #e74c62  /* Vermelho rosado */
cfo-600: #d32f4a  /* Vermelho CFO - Principal */
cfo-700: #b91d3c  /* Vermelho escuro - Hover */
cfo-800: #9a1a37  /* Vinho - Headers */
cfo-900: #821834  /* Vinho escuro - Headers */
cfo-950: #480918  /* Bordô profundo */
```

### Uso das Cores

#### Headers
- **Background**: `bg-gradient-to-r from-cfo-800 to-cfo-900`
- **Texto**: `text-white`
- **Subtítulo**: `text-cfo-100`

#### Botões Primários
- **Background**: `bg-gradient-to-r from-cfo-600 to-cfo-700`
- **Hover**: `hover:from-cfo-700 hover:to-cfo-800`
- **Texto**: `text-white`

#### Cards e Destaques
- **Borda**: `border-cfo-600`
- **Fundo selecionado**: `bg-cfo-50`
- **Ícones**: `text-cfo-700`

#### Links e Textos de Destaque
- **Links**: `text-cfo-700 hover:text-cfo-800`
- **Badges**: `bg-cfo-100 text-cfo-900`

## Componentes Principais

### 1. Header Institucional

```tsx
<header className="bg-gradient-to-r from-cfo-800 to-cfo-900 text-white shadow-xl">
  <div className="container mx-auto px-4 py-6">
    <h1 className="text-3xl font-bold">Conselho Federal de Odontologia</h1>
    <p className="text-cfo-100 mt-1">Sistema de Consulta Pública</p>
  </div>
</header>
```

### 2. Banner Hero

```tsx
<div className="bg-gradient-to-r from-cfo-700 to-cfo-600 text-white py-16">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-5xl font-bold mb-4">Consulta Pública</h2>
    <p className="text-2xl text-cfo-50">Novos Códigos de Ética</p>
  </div>
</div>
```

### 3. Cards Informativos

```tsx
<div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cfo-600">
  <div className="bg-cfo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-cfo-700">...</svg>
  </div>
  <h3 className="font-bold text-lg text-gray-900">Título</h3>
  <p className="text-gray-600 text-sm">Descrição</p>
</div>
```

### 4. Botões

#### Primário
```tsx
<button className="bg-gradient-to-r from-cfo-600 to-cfo-700 hover:from-cfo-700 hover:to-cfo-800 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
  Texto do Botão
</button>
```

#### Secundário
```tsx
<button className="border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg">
  Texto do Botão
</button>
```

### 5. Inputs e Formulários

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
/>
```

### 6. Radio/Checkbox Customizados

```tsx
<label className="block cursor-pointer">
  <input type="radio" className="sr-only" />
  <div className="border-2 rounded-xl p-6 border-gray-200 hover:border-cfo-300 hover:bg-cfo-50 transition-all">
    <div className="w-6 h-6 rounded-full border-2 border-cfo-600 bg-cfo-600">
      <svg className="w-4 h-4 text-white">✓</svg>
    </div>
  </div>
</label>
```

### 7. Alertas e Avisos

#### LGPD (Amarelo)
```tsx
<div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
  <div className="flex items-start">
    <svg className="w-6 h-6 text-amber-600 mr-3">...</svg>
    <div>
      <p className="font-semibold text-amber-900">Proteção de Dados</p>
      <p className="text-xs text-amber-800">Texto...</p>
    </div>
  </div>
</div>
```

#### Informação (CFO)
```tsx
<div className="bg-cfo-50 border-l-4 border-cfo-600 p-4">
  <p className="text-sm text-cfo-900">
    <strong>Importante:</strong> Texto...
  </p>
</div>
```

### 8. Footer

```tsx
<footer className="bg-gray-900 text-white py-8">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-3 gap-8">
      <!-- Conteúdo do footer -->
    </div>
    <div className="border-t border-gray-800 pt-6 text-center">
      <p className="text-sm text-gray-400">
        © 2026 Conselho Federal de Odontologia
      </p>
    </div>
  </div>
</footer>
```

## Tipografia

### Títulos
- **H1**: `text-3xl md:text-5xl font-bold`
- **H2**: `text-2xl md:text-3xl font-bold`
- **H3**: `text-xl font-bold`

### Textos
- **Body**: `text-base text-gray-700`
- **Secundário**: `text-sm text-gray-600`
- **Pequeno**: `text-xs text-gray-500`

## Espaçamentos

### Containers
- **Max Width**: `max-w-5xl mx-auto`
- **Padding**: `px-4 md:px-8`

### Seções
- **Vertical**: `py-12` ou `py-16`
- **Cards**: `p-6` ou `p-8`

## Sombras

- **Leve**: `shadow-lg`
- **Média**: `shadow-xl`
- **Forte**: `shadow-2xl`

## Transições

Sempre adicionar transições suaves:

```tsx
className="transition-all duration-200"
```

## Responsividade

### Breakpoints (TailwindCSS)
- **sm**: 640px
- **md**: 768px (tablets)
- **lg**: 1024px (desktops)
- **xl**: 1280px

### Grid Responsivo
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Texto Responsivo
```tsx
<h1 className="text-2xl md:text-3xl lg:text-5xl">
```

## Acessibilidade

### Contraste
- Todas as cores atendem WCAG 2.1 AA
- Texto branco em `cfo-800/900`
- Texto escuro em `cfo-50/100`

### Foco
```tsx
focus:ring-2 focus:ring-cfo-500 focus:outline-none
```

### Screen Readers
```tsx
<input type="radio" className="sr-only" />
```

## Ícones

Utilizamos ícones SVG inline do Heroicons:
- **Size padrão**: `w-6 h-6`
- **Pequeno**: `w-4 h-4`
- **Grande**: `w-8 h-8`

## Estados

### Hover
```tsx
hover:bg-cfo-50
hover:border-cfo-500
hover:shadow-lg
hover:-translate-y-0.5
```

### Disabled
```tsx
disabled:bg-gray-300
disabled:cursor-not-allowed
disabled:opacity-50
```

### Active/Selected
```tsx
border-cfo-600
bg-cfo-50
shadow-lg
```

## Animações

### Transform
```tsx
transition-all duration-200
hover:-translate-y-0.5
```

### Fade
```tsx
transition-opacity duration-300
```

## Boas Práticas

1. **Consistência**: Use sempre as classes do design system
2. **Espaçamento**: Mantenha espaçamentos uniformes
3. **Cores**: Use apenas cores da paleta CFO
4. **Transições**: Sempre adicione transições suaves
5. **Acessibilidade**: Garanta contraste adequado
6. **Responsividade**: Teste em mobile, tablet e desktop
7. **Performance**: Evite animações pesadas

## Exemplos de Páginas

### Página Inicial
- Header CFO institucional
- Banner hero com gradiente
- Cards informativos
- Seleção de documentos
- Footer completo

### Página de Identificação
- Header simplificado
- Formulário estruturado
- Validações em tempo real
- Botões destacados

### Página de Contribuição
- Lista de contribuições
- Formulário expansível
- Protocolo com destaque
- Confirmação visual

## Recursos

- **Tailwind Config**: `frontend/tailwind.config.ts`
- **Cores**: Paleta CFO completa
- **Componentes**: Reutilizáveis em todas as páginas

---

**Design System v1.0** - Conselho Federal de Odontologia
