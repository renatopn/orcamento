document.addEventListener('DOMContentLoaded', function() {
    // Elementos da tela de configuração
    const configScreen = document.getElementById('config-screen');
    const editScreen = document.getElementById('edit-screen');
    const imageUrlInput = document.getElementById('image-url');
    const productCodeInput = document.getElementById('product-code');
    const productDescInput = document.getElementById('product-desc');
    const advanceBtn = document.getElementById('advance-btn');
    const startBtn = document.getElementById('start-btn');
    const productsList = document.getElementById('products-list');

    // Elementos da tela de edição
    const configProductsBtn = document.getElementById('config-products-btn');
    const editDataBtn = document.getElementById('edit-data-btn');
    const saveCookiesBtn = document.getElementById('save-cookies-btn');
    const deleteCookiesBtn = document.getElementById('delete-cookies-btn');
    const loadCookiesBtn = document.getElementById('load-cookies-btn');
    const printBtn = document.getElementById('print-btn');
    const shoppingListArea = document.getElementById('shopping-list-area');
    const shoppingList = document.getElementById('shopping-list');
    const selectionArea = document.getElementById('selection-area');
    const environmentTitle = document.getElementById('environment-title');
    const finishEnvironmentBtn = document.getElementById('finish-environment-btn');
    const searchInput = document.getElementById('search-input');
    const favoriteFilters = document.getElementById('favorite-filters');
    const filteredItems = document.getElementById('filtered-items');

    // Elementos dos modais
    const environmentModal = document.getElementById('environment-modal');
    const environmentNameInput = document.getElementById('environment-name');
    const saveEnvironmentBtn = document.getElementById('save-environment-btn');
    const cancelEnvironmentBtn = document.getElementById('cancel-environment-btn');
    const editDataModal = document.getElementById('edit-data-modal');
    const jsonDataTextarea = document.getElementById('json-data');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const cancelJsonBtn = document.getElementById('cancel-json-btn');

    // Estado da aplicação
    let products = [];
    let shoppingData = {};
    let currentEnvironment = null;
    let favoriteFilterTexts = new Set();

    // Inicialização
    loadFromCookies();
    renderProductsList();

    // Event Listeners - Tela de Configuração
    advanceBtn.addEventListener('click', addProduct);
    startBtn.addEventListener('click', startEditing);

    // Event Listeners - Tela de Edição
    configProductsBtn.addEventListener('click', showConfigScreen);
    editDataBtn.addEventListener('click', showEditDataModal);
    saveCookiesBtn.addEventListener('click', saveToCookies);
    deleteCookiesBtn.addEventListener('click', deleteCookies);
    loadCookiesBtn.addEventListener('click', loadFromCookies);
    printBtn.addEventListener('click', printShoppingList);
    finishEnvironmentBtn.addEventListener('click', finishEnvironment);
    searchInput.addEventListener('input', filterItems);

    // Event Listeners - Modais
    saveEnvironmentBtn.addEventListener('click', saveEnvironment);
    cancelEnvironmentBtn.addEventListener('click', () => {
        changeEnvironment(currentEnvironment);
       
    });
    saveJsonBtn.addEventListener('click', saveJsonData);
    cancelJsonBtn.addEventListener('click', () => editDataModal.classList.add('hidden'));

    // Funções da Tela de Configuração
    function addProduct() {
        const url = imageUrlInput.value.trim();
        const code = productCodeInput.value.trim();
        const desc = productDescInput.value.trim();

        if (!url || !code || !desc) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const product = {
            url,
            code,
            desc
        };

        products.push(product);
        renderProductsList();

        // Limpar campos
        imageUrlInput.value = '';
        productCodeInput.value = '';
        productDescInput.value = '';
    }

    function renderProductsList() {
        productsList.innerHTML = '';
        
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.url}" alt="${product.desc}" onerror="this.src='https://via.placeholder.com/200?text=Imagem+não+disponível'">
                <div class="product-info">
                    <span>${product.code} - ${product.desc}</span>
                </div>
                <button class="delete-btn" data-index="${index}">X</button>
            `;
            
            productsList.appendChild(productCard);
        });

        // Adicionar event listeners para os botões de deletar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                products.splice(index, 1);
                renderProductsList();
            });
        });
    }

    function startEditing() {
        if (products.length === 0) {
            alert('Adicione pelo menos um produto antes de iniciar');
            return;
        }

        configScreen.classList.add('hidden');
        editScreen.classList.remove('hidden');
        askForEnvironment();
    }

    // Funções da Tela de Edição
    function showConfigScreen() {
        editScreen.classList.add('hidden');
        configScreen.classList.remove('hidden');
    }

    function askForEnvironment() {
        environmentNameInput.value = '';
        environmentModal.classList.remove('hidden');
    }

    function saveEnvironment() {
        const envName = environmentNameInput.value.trim();
        
        if (!envName) {
            alert('Por favor, digite um nome para o ambiente');
            return;
        }

        currentEnvironment = envName;
        
        if (!shoppingData[envName]) {
            shoppingData[envName] = [];
        }
        
        environmentTitle.textContent = envName;
        environmentModal.classList.add('hidden');
        renderFilteredItems();
        renderShoppingList();
    }

    function finishEnvironment() {
        askForEnvironment();
    }

    function filterItems() {
        const searchText = searchInput.value.trim().toLowerCase();
        renderFilteredItems(searchText);
    }

    function addFavoriteFilter(filterText) {
        if (favoriteFilterTexts.has(filterText)) return;
        
        favoriteFilterTexts.add(filterText);
        
        const filterSpan = document.createElement('span');
        filterSpan.className = 'favorite-filter';
        filterSpan.textContent = filterText;
        
        filterSpan.addEventListener('click', function() {
            searchInput.value = filterText;
            filterItems();
        });
        
        favoriteFilters.appendChild(filterSpan);
    }

    function renderFilteredItems(filterText = '') {
        filteredItems.innerHTML = '';
        
        const filtered = products.filter(product => {
            if (!filterText) return true;
            
            return product.code.toLowerCase().includes(filterText) || 
                   product.desc.toLowerCase().includes(filterText);
        });
        
        filtered.forEach(product => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            
            itemCard.innerHTML = `
                <img src="${product.url}" alt="${product.desc}" onerror="this.src='https://via.placeholder.com/200?text=Imagem+não+disponível'">
                <span class="item-info">${product.code} - ${product.desc}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" min="0" value="0" class="quantity-input">
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="add-btn" data-code="${product.code}">Adicionar</button>
            `;
            
            filteredItems.appendChild(itemCard);
            
            // Adicionar event listeners para os controles de quantidade
            const minusBtn = itemCard.querySelector('.minus');
            const plusBtn = itemCard.querySelector('.plus');
            const quantityInput = itemCard.querySelector('.quantity-input');
            
            minusBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
            
            plusBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
            });
            
            // Adicionar event listener para o botão de adicionar
            const addBtn = itemCard.querySelector('.add-btn');
            addBtn.addEventListener('click', function() {
                const quantity = parseInt(quantityInput.value);
                addToShoppingList(product, quantity);

                // Adicionar ao favoritos se for uma pesquisa válida
                const searchText = searchInput.value.trim().toLowerCase();
                if (searchText && filteredItems.children.length > 0 && !favoriteFilterTexts.has(searchText)) {
                    addFavoriteFilter(searchText);
                }
                quantityInput.value = 0;
            });
        });
    }

    function addToShoppingList(product, quantity) {
        
        if (!currentEnvironment) {
           return;
        }

        // Verificar se o produto já existe no ambiente
        const existingItemIndex = shoppingData[currentEnvironment].findIndex(
            item => item.code === product.code
        );
        
        if (existingItemIndex >= 0) {
            // Atualizar quantidade se o produto já existir
            shoppingData[currentEnvironment][existingItemIndex].quantity += quantity;
            shoppingData[currentEnvironment][existingItemIndex].lastAdded = quantity;
        } else {
            // Adicionar novo item
            shoppingData[currentEnvironment].push({
                ...product,
                quantity
            });
        }
        
        renderShoppingList();
    }

    function changeEnvironment(envName){
        currentEnvironment = envName;
        if(!currentEnvironment){
            if(Object.keys(shoppingData).length>0){
            currentEnvironment = Object.keys(shoppingData)[Object.keys(shoppingData).length - 1];
            }else{
                return;
            }
        }
        

        document.querySelectorAll('.environment-group').forEach(div => {


            if(div.querySelector('span').textContent === currentEnvironment){
                
                div.querySelectorAll('.environment-items').forEach(items => {
                    items.classList.remove('hidden');
                });
                div.querySelectorAll('.toggle-environment-btn').forEach(btn => {
                    btn.textContent = '▼';
                });
            }else{
                 // Fechar todos os ambientes anteriores
                 div.querySelectorAll('.environment-items').forEach(items => {
                    items.classList.add('hidden');
                });
                div.querySelectorAll('.toggle-environment-btn').forEach(btn => {
                    btn.textContent = '▶';
                });
            }

        });
        
         
         if (!shoppingData[currentEnvironment]) {
             shoppingData[currentEnvironment] = [];
         }
         
         environmentTitle.textContent = currentEnvironment;
         environmentModal.classList.add('hidden');

    }

    // Modificar a função saveEnvironment
    function saveEnvironment() {
        const envName = environmentNameInput.value.trim();
        
        if (!envName) {
            alert('Por favor, digite um nome para o ambiente');
            return;
        }

        currentEnvironment = envName;
        
        if (!shoppingData[envName]) {
            shoppingData[envName] = [];
        }
        
        environmentTitle.textContent = envName;
        environmentModal.classList.add('hidden');
        renderFilteredItems();
        renderShoppingList();
        changeEnvironment(envName);
    }

    // Nova função para fechar todos os ambientes
    function closeAllEnvironments() {
        document.querySelectorAll('.environment-items').forEach(items => {
            items.classList.add('hidden');
        });
        document.querySelectorAll('.toggle-environment-btn').forEach(btn => {
            btn.textContent = '▶';
        });
    }

    
    function renderShoppingList() {
        shoppingList.innerHTML = '';
        
        for (const envName in shoppingData) {
            const envGroup = document.createElement('div');
            envGroup.className = 'environment-group';
            
            const envHeader = document.createElement('div');
            envHeader.className = 'environment-header';
            
            envHeader.innerHTML = `
                <div>
                    <button class="toggle-environment-btn">▼</button>
                    <span>${envName}</span>
                </div>
                <button class="edit-environment-btn" data-env="${envName}">✏️</button>
            `;
            
            const envItems = document.createElement('div');
            envItems.className = 'environment-items';
            
            shoppingData[envName].forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'environment-item';
                
                itemDiv.innerHTML = `
                    
                    <img src="${item.url}" alt="${item.desc}" onerror="this.src='https://via.placeholder.com/200?text=Imagem+não+disponível'">
                    <div class="environment-item-details">
                        <div>${item.code} - ${item.desc}</div>
                        <div>Quantidade: ${item.quantity}</div>
                        ${item.lastAdded && item.lastAdded > 0 ? `
                            <div>Último : ${item.lastAdded}
                                <button class="revert-item-btn" data-env="${envName}" data-code="${item.code}" data-lastAdded="${item.lastAdded}">↩</button>
                            </div>
                        ` : ''}
                    </div>
                    <button class="delete-item-btn" data-env="${envName}" data-code="${item.code}">🗑️</button>
                `;
                
                envItems.appendChild(itemDiv);
            });
            
            // Adicionar event listeners para os botões de deletar
            envItems.querySelectorAll('.delete-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const env = this.getAttribute('data-env');
                    const code = this.getAttribute('data-code');
                    
                    shoppingData[env] = shoppingData[env].filter(item => item.code !== code);
                  
                    renderShoppingList();
                });
            });

            // Adicionar event listeners para os botões de deletar
            envItems.querySelectorAll('.revert-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const env = this.getAttribute('data-env');
                    const code = this.getAttribute('data-code');
                    const lastAdded = this.getAttribute('data-lastAdded');
                    const item = shoppingData[env].find(item => item.code === code);
                    if (!item) return;
                    const newQuantity = item.quantity - parseInt(lastAdded);
                    if (newQuantity < 0) {
                        alert('Quantidade não pode ser negativa');
                        return;
                    }
                    item.quantity = newQuantity;
                    item.lastAdded = null;
                    if (newQuantity === 0) {
                        shoppingData[env] = shoppingData[env].filter(item => item.code !== code);
                    }
                    
                    renderShoppingList();
                });
            });

            envGroup.appendChild(envHeader);
            envGroup.appendChild(envItems);
            shoppingList.appendChild(envGroup);
            
            // Adicionar event listeners para os botões do ambiente
            const toggleBtn = envHeader.querySelector('.toggle-environment-btn');
            const editBtn = envHeader.querySelector('.edit-environment-btn');
            
            toggleBtn.addEventListener('click', function() {
                const envName = this.parentElement.querySelector('span').textContent;
                
                if (currentEnvironment !== envName) {
                   envItems.classList.remove('hidden');
                   this.textContent = '▼';
                   changeEnvironment(envName);
                }
            });
            
            editBtn.addEventListener('click', function() {
                const oldEnvName = this.getAttribute('data-env');
                environmentNameInput.value = oldEnvName;
                environmentModal.classList.remove('hidden');
                
                saveEnvironmentBtn.addEventListener('click', function renameEnvironment() {
                    const newEnvName = environmentNameInput.value.trim();
                    
                    if (!newEnvName || newEnvName === oldEnvName) {
                        environmentModal.classList.add('hidden');
                        saveEnvironmentBtn.removeEventListener('click', renameEnvironment);
                        return;
                    }
                    
                    // Renomear o ambiente
                    shoppingData[newEnvName] = shoppingData[oldEnvName];
                    delete shoppingData[oldEnvName];
                    
                    if (currentEnvironment === oldEnvName) {
                        currentEnvironment = newEnvName;
                        environmentTitle.textContent = newEnvName;
                    }
                    
                    environmentModal.classList.add('hidden');
                    renderShoppingList();
                    saveEnvironmentBtn.removeEventListener('click', renameEnvironment);
                }, { once: true });
            });
        }
        changeEnvironment(currentEnvironment);
    }

    // Funções de Edição de Dados
    function showEditDataModal() {
        jsonDataTextarea.value = JSON.stringify({
            products,
            shoppingData,
            favoriteFilters: Array.from(favoriteFilterTexts)
        }, null, 2);
        editDataModal.classList.remove('hidden');
    }

    function saveJsonData() {
        try {
            const data = JSON.parse(jsonDataTextarea.value);
            
            if (!data.products || !data.shoppingData) {
                throw new Error('Formato inválido');
            }
            
            products = data.products;
            shoppingData = data.shoppingData;
            favoriteFilterTexts = new Set(data.favoriteFilters || []);
            
            renderProductsList();
            renderShoppingList();
            renderFilteredItems();
            renderFavoriteFilters();
            
            editDataModal.classList.add('hidden');
        } catch (error) {
            alert('Erro ao analisar JSON: ' + error.message);
        }
    }

    function renderFavoriteFilters() {
        favoriteFilters.innerHTML = '';
        favoriteFilterTexts.forEach(filterText => {
            addFavoriteFilter(filterText);
        });
    }

    // Funções de Cookies
    function saveToCookies() {
        const data = {
            products,
            shoppingData,
            favoriteFilters: Array.from(favoriteFilterTexts)
        };
        
        document.cookie = `shoppingListData=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 dias
        alert('Dados salvos em cookies com sucesso!');
    }

    function deleteCookies() {
        document.cookie = "shoppingListData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        alert('Dados apagados dos cookies!');
    }

    function loadFromCookies() {
        const cookies = document.cookie.split('; ');
        const dataCookie = cookies.find(c => c.startsWith('shoppingListData='));
        
        if (dataCookie) {
            try {
                const cookieValue = decodeURIComponent(dataCookie.split('=')[1]);
                const data = JSON.parse(cookieValue);
                
                products = data.products || [];
                shoppingData = data.shoppingData || {};
                favoriteFilterTexts = new Set(data.favoriteFilters || []);
                
                renderProductsList();
                renderFavoriteFilters();
                
                // Se estivermos na tela de edição, atualizar também essas visualizações
                if (!editScreen.classList.contains('hidden')) {
                    renderFilteredItems();
                    renderShoppingList();
                }
                
                alert('Dados recuperados de cookies com sucesso!');
            } catch (error) {
                console.error('Erro ao carregar cookies:', error);
            }
        } else {
            console.log('Nenhum dado encontrado em cookies');
        }
    }

    // Função de Impressão
    function printShoppingList() {
        // Calcular totais
        const reducedList = {};
        
        for (const envName in shoppingData) {
            shoppingData[envName].forEach(item => {
                if (!reducedList[item.code]) {
                    reducedList[item.code] = {
                        url: item.url,
                        code: item.code,
                        desc: item.desc,
                        total: 0,
                        byEnvironment: {}
                    };
                }
                
                reducedList[item.code].total += item.quantity;
                reducedList[item.code].byEnvironment[envName] = item.quantity;
            });
        }
        
        // Criar conteúdo para impressão
        const printWindow = window.open('', '_blank');
        
        // HTML para impressão
        let printHTML = `
            <html>
            <head>
                <title>Lista de Compras</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1, h2 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 2px; text-align: center; }
                    th { background-color: #f2f2f2; }
                    img { height: 60px;  object-fit: scale-down; border-radius: 4px; }
                    .print-section { page-break-after: always; margin-bottom: 40px; }
                    .print-section:last-child { page-break-after: avoid; }
                    .td-desc:nth-child(4) { text-align: left;}
                </style>
            </head>
            <body>
                <div id="print-content">
                    <div class="print-section">
                        <h1>Lista de Compras Reduzida</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ordem</th>
                                    <th>Imagem</th>
                                    <th>Código</th>
                                    <th>Descrição</th>
                                    <th>Quantidade Total</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Adicionar itens à lista reduzida
        let order = 1;
        for (const code in reducedList) {
            const item = reducedList[code];
            printHTML += `
                <tr>
                    <td class="td-desc">${order++}</td>
                    <td class="td-desc"><img src="${item.url}"></td>
                    <td class="td-desc">${item.code}</td>
                    <td class="td-desc">${item.desc}</td>
                    <td class="td-desc">${item.total}</td>
                </tr>
            `;
        }
        
        printHTML += `
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="print-section">
                        <h1>Lista de Compras por Ambiente</h1>
        `;
        
        // Adicionar itens por ambiente
        for (const envName in shoppingData) {
            printHTML += `
                <h2>${envName}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Ordem</th>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let envOrder = 1;
            shoppingData[envName].forEach(item => {
                printHTML += `
                    <tr>
                        <td>${envOrder++}</td>
                        <td>${item.code}</td>
                        <td>${item.desc}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `;
            });
            
            printHTML += `
                    </tbody>
                </table>
            `;
        }
        
        printHTML += `
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Escrever o conteúdo e imprimir
        printWindow.document.open();
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Esperar o conteúdo carregar antes de imprimir
        printWindow.onload = function() {
            printWindow.print();
        };
    }
});
