# Qualidade do banner da página inicial

## Intenção

Eliminar o aspecto pixelado e o zoom excessivo do banner da página inicial, mantendo a foto, o conteúdo sobreposto e a responsividade existentes.

## Objetivos

- Usar uma versão de alta resolução da imagem atual.
- Manter o banner preenchendo a largura disponível sem distorcer a foto.
- Controlar o enquadramento em desktop, tablet e celular para preservar os produtos.
- Evitar regressões no cabeçalho, textos e botão do banner.

## Fora do escopo

- Redesenhar a página inicial.
- Alterar textos, cores, tipografia ou navegação.
- Modificar outras imagens do projeto.

## Abordagens consideradas

1. **Imagem de alta resolução com recorte responsivo — escolhida.** Mantém o visual cheio do banner e resolve a perda de nitidez na origem. Breakpoints controlam o ponto focal sem deformação.
2. **Exibir a imagem pequena inteira.** Evita ampliação, mas cria espaços vazios ou um banner excessivamente alto e não atende ao visual atual.
3. **Somente alterar `background-size`.** Reduz a sensação de zoom em alguns tamanhos, porém não resolve a baixa resolução do arquivo de 687 × 515 px.

## Implementação proposta

- Produzir um novo asset de alta resolução a partir da foto atual, preservando composição e aparência.
- Substituir o background inline por marcação responsiva apropriada, mantendo uma camada separada para o gradiente e o conteúdo.
- Usar dimensionamento proporcional (`object-fit: cover`) e `object-position` específico por breakpoint.
- Definir altura fluida com limites mínimos/máximos, sem esticar a imagem.
- Validar build e comportamento visual nos breakpoints de desktop, tablet e celular.

## Critérios de aceitação

- O banner não apresenta pixelização perceptível em telas desktop Full HD.
- A imagem nunca é deformada.
- O conteúdo continua legível e não transborda em telas pequenas.
- O enquadramento não apresenta o zoom excessivo atual.
- O build do frontend permanece aprovado.
