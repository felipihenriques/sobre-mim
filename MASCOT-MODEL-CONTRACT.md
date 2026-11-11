# Integração do mascote oficial

## Estado atual

O modelo fiel às referências ainda precisa ser produzido por modelagem e rigging. O antigo modelo procedural não corresponde fielmente às imagens oficiais e não é ativado no portfólio. A página mostra uma imagem estática identificada pelo seu texto alternativo. Não existe rotação de PNG ou troca de imagens disfarçada de animação tridimensional.

As referências oficiais estão em `assets/mascot-reference-front.png`, `assets/mascot-reference-side.png` e `assets/mascot-reference-back.png`.

## Entrega necessária

- GLB 2.0 autocontido, materiais e texturas incorporados, sem Draco/Meshopt/KTX2.
- Personagem sentado, com as proporções, cabelo castanho, barba, óculos azuis, moletom, calça, tênis e notebook das referências.
- Malha deformável com skinning e pesos revisados. Notebook rigidamente preso ao suporte correto, sem flutuar durante a pose.
- Ossos de cabeça, peito, pelve, braço levantado, antebraço, mão, coxas e canelas.
- Três ossos para cada um dos cinco dedos da mão levantada.
- Morph `eyeBlink` para piscadas. Ele é opcional no carregamento; a interface informa quando está ausente. Outras expressões precisam ser produzidas no modelo; não são inventadas pelo visualizador.
- Frente voltada para +Z, eixo vertical +Y. Flexão dos dedos no +X local, braço esquerdo levantado. Para outro sistema de eixos, adaptar os controles de rotação no código.
- Posição de repouso com mão aberta, braço levantado e notebook posicionado. O código adiciona movimentos discretos à pose; não reposiciona um personagem em T-pose.

## Nomes de articulações

O carregador reconhece os nomes Mixamo usuais e alguns nomes Blender. Para nomes diferentes, preencher `bones` em `mascot-asset.js`, mapeando as seguintes chaves para os nomes exatos:

`head`, `chest`, `pelvis`, `upperArm`, `forearm`, `hand`, `leftThigh`, `rightThigh`, `leftShin`, `rightShin`, `thumb1..3`, `index1..3`, `middle1..3`, `ring1..3`, `pinky1..3`.

Todos esses ossos são obrigatórios. O importador recusa arquivos sem skinning ou com mapeamento incompleto. O modelo procedural antigo é recusado por esse critério.

## Teste e ativação

1. Abrir `mascot-studio.html` e importar o GLB. O arquivo é lido localmente, sem upload para terceiros.
2. Conferir identidade visual, todos os ângulos, contato com o notebook, dedos e deformações.
3. Usar as seis etapas para configurar scroll, mão, iluminação e testes. Preferências são salvas em localStorage quando disponível; o arquivo importado fica somente na sessão.
4. Após aprovação visual, copiar o arquivo para `assets/` e definir `url`, `approved: true`, `bones` e `blinkMorph` em `mascot-asset.js`.
5. Abrir o site por HTTP para carregar o GLB automaticamente. Em file:// o navegador pode bloquear fetch do modelo; o estúdio continua aceitando importação manual.

O movimento usa a fração real de scroll com suavização e é reversível. A rotação vai de 0 a 360°. O clique fecha os cinco dedos, mantém o punho brevemente e reabre. Respiração e movimentos discretos são calculados nas articulações; as piscadas usam o morph fornecido pelo modelo. O carregador mantém a referência estática se houver falha.

## Limites e validação

Não há promessa de fidelidade absoluta, texturas 4K ou 60 FPS sem produzir e revisar o modelo final. A opção 4K apenas aumenta a resolução de renderização até 3840 × 2160, respeitando a proporção. A qualidade do material depende do GLB e o desempenho depende do dispositivo.

O carregador, o mapeamento e os testes de interface precisam ser revisados visualmente com um GLB fiel antes da ativação. A estrutura preparada não equivale ao personagem finalizado.

## Controle por cursor
O visualizador oferece acompanhamento horizontal e vertical suavizado, pressionar/soltar para fechar/abrir a mão, alternância opcional por clique, duplo clique para acenar, arraste, retorno frontal após dois segundos, sensibilidade, velocidade e pausa. O polegar usa oposição em Z e flexão em X: esses eixos e amplitudes precisam ser calibrados no GLB definitivo. Olhos acompanham o cursor somente se houver ossos LeftEye/RightEye ou equivalentes Mixamo. As três imagens permanecem referências estáticas; este código não reconstrói automaticamente um personagem fiel a partir delas. Validação realizada: sintaxe e contrato estrutural. Interação e resultado visual ainda não validados com um modelo fiel.
