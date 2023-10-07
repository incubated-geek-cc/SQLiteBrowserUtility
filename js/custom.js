if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    callback();
} else {
    document.addEventListener('DOMContentLoaded', async() => {
        console.log('DOMContentLoaded');

        const dropFileZone=document.querySelector('#dropFileZone');
        const dropFileInnerZone=dropFileZone.querySelector('.card-body');

        const clearCache=document.querySelector('#clearCache');
        clearCache.addEventListener('click', () => {
            requestAnimationFrame(() => {
                localStorage.clear();
                location.reload();
            });
        });

        const copyrightYearDisplay = document.querySelector('#copyrightYearDisplay');
        copyrightYearDisplay.innerHTML = new Date().getFullYear();

        const popoverTargets = document.querySelectorAll('[data-content]');
        Array.from(popoverTargets).map(
            popTarget => new BSN.Popover(popTarget, {
                placement: 'right',
                animation: 'show',
                delay: 100,
                dismissible: true,
                trigger: 'click'
            })
        );

        if (!window.FileReader) {
            errorDisplay.innerHTML = '<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'FileReader\' function required to open a file.';
            return;
        }
        if (!window.Blob) {
            errorDisplay.innerHTML = '<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'Blob\' function required to save a file.';
            return;
        }

        // IE8
        // IE9+ and other modern browsers
        function triggerEvent(el, type) {
            let e = ( ('createEvent' in document) ? document.createEvent('HTMLEvents') : document.createEventObject() );
            if ('createEvent' in document) { 
              e.initEvent(type, false, true);
              el.dispatchEvent(e);
            } else { 
              e.eventType = type;
              el.fireEvent('on' + e.eventType, e);
            }
        }

        function htmlToElement(html) {
            let documentFragment = document.createDocumentFragment();
            let template = document.createElement('template');
            template.innerHTML = html.trim();
            for (let i = 0, e = template.content.childNodes.length; i < e; i++) {
                documentFragment.appendChild(template.content.childNodes[i].cloneNode(true));
            }
            return documentFragment;
        }

        const toggleSidebarBtn = document.querySelector('#toggleSidebarBtn');
        const asideLeftSidebar = document.querySelector('aside.left-sidebar');
        const mainWrapper = document.querySelector('#main-wrapper');
        const pageWrapper = mainWrapper.querySelector('.page-wrapper');
        toggleSidebarBtn.addEventListener('click', (evt) => {
            let currentVal = evt.target.value;
            let latestVal = (currentVal == 'true') ? 'false' : 'true';
            toggleSidebarBtn.value = latestVal;
            if (latestVal == 'true') {
                asideLeftSidebar['style']['width'] = '0px';
                pageWrapper['style']['margin-left'] = '0px';
            } else if (latestVal == 'false') {
                asideLeftSidebar['style']['width'] = '240px';
                pageWrapper['style']['margin-left'] = '240px';
            }
        });

        const infoModalBtn = document.querySelector('#infoModalBtn');
        const infoModalContent = `<div class="modal-header">
                                    <h5 class="modal-title"><span class='mr-2 font-weight-bolder symbol'>𝖎</span> About SQLite Browser Tool</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                  </div>
                                  <div class="modal-body">
                                    <div class="row">
                                        <div class="col-sm-12 text-left">
                                            <p><span class="symbol">➊</span> SQLite is a <abbr title="Relational Database Management System">RDBMS</abbr> with no dependencies and able to operate offline in-browser without a database engine.</p>

                                            <p><span class="symbol">➋</span> <span class="emoji">🚫</span> No server-side processing <span class='symbol'>⇒</span> No server setup required.</p>

                                            <p><span class="symbol">➌</span> Application uses plugin from <cite title="sql.js is a relational database for the web."><a href="https://github.com/sql-js/sql.js" target="_blank">sql.js</a></cite> where original work was by Kripken <cite title="sql.js/sql.js: A javascript library to run SQLite on the web."><a href="https://github.com/kripken/sql.js/" target="_blank">sql.js</a></cite> which is <a href="LICENSE.txt" target="_blank">MIT licensed</a>.</p>

                                            <p><span class="symbol">➍</span> <span class="emoji">📱</span> Mobile-responsive and works on JavaScript-enabled mobile web browsers as well.</p>
                                        </div>
                                    </div>
                                  </div>
                                  <div class="modal-footer text-right">
                                    <small><span class='symbol pl-1 pr-1'>— Created by</span><a href="https://medium.com/@geek-cc" target="_blank"><span class="symbol">ξ(</span><span class="emoji">🎀</span><span class="symbol">˶❛◡❛) ᵀᴴᴱ ᴿᴵᴮᴮᴼᴺ ᴳᴵᴿᴸ</span>
                                    </a></small><span class='symbol pl-1 pr-1'><a href='https://github.com/incubated-geek-cc/' target='_blank'><span data-profile='github' class='attribution-icon'></span></a> ▪ <a href='https://medium.com/@geek-cc' target='_blank'><span data-profile='medium' class='attribution-icon'></span></a> ▪ <a href='https://www.linkedin.com/in/charmaine-chui-15133282/' target='_blank'><span data-profile='linkedin' class='attribution-icon'></span></a> ▪ <a href='https://twitter.com/IncubatedGeekCC' target='_blank'><span data-profile='twitter' class='attribution-icon'></span></a></span>
                                  </div>`;

        
        async function showLoadingSignal(modalTitle) {
            let modalHeader='<div class="modal-header"><h5 class="modal-title">'+modalTitle+'</h5></div>';
            const modalContent = `<div class="modal-body">
                                    <div class="row">
                                        <div class="col-sm-12 text-center">
                                            <div class="spinner-border text-muted"></div>
                                            <div class="text-secondary">Loading...</div>
                                        </div>
                                    </div>
                                  </div>`;

            siteModalInstance.setContent(modalHeader + modalContent);
            // wait 100 milliseconds
            await new Promise((resolve, reject) => setTimeout(resolve, 100));
            siteModalInstance.show();
            return await Promise.resolve('Loading');
        }


        const siteModalInstance = new BSN.Modal(
          '#siteModal', { 
            content: '',
            backdrop: false,
            keyboard: false
          }
        );
        infoModalBtn.addEventListener('click', ()=>{
            siteModalInstance.setContent(infoModalContent);
            siteModalInstance.toggle();
        });

        const displayedRecordsRange = document.querySelector('#displayedRecordsRange');
        const noOfTablesDisplay = document.querySelector('#noOfTablesDisplay');

        const dbTableDetails = document.querySelector('#dbTableDetails');
        const errorDisplay = document.querySelector('#errorDisplay');

        const codeEditor = document.querySelector('#codeEditor');
        const lineCounter = document.querySelector('#lineCounter');
        const filters = document.querySelector('#filters');
        
        const runQueryBtn = document.querySelector('#runQueryBtn');
        // The older asm.js version of Sql.js. Slower and larger. Provided for compatibility reasons. 
        // Handles error: Cannot enlarge memory arrays
        const SQL = await initSqlJs({
          locateFile: file => './js/sql-wasm.wasm'
        });
        // console.log(SQL);
        var db = null;

        const tblIcon = '▦ ';
        const nil = '---';
        const recordsPerPage = 100;
        // =============== QUERY TAB =============================
        var queryStmt = '';
        var queryResultset = [];

        var currentQueryPage = 1;
        var originalQueryStmt = '';
        var noOfQueryPages = 1;
        var totalNoOfQueryRecords = 0;
        var queryOffset = 0;

        const tableQueryRecords = document.querySelector('#tableQueryRecords');
        const tableQueryPagination = document.querySelector('#tableQueryPagination');

        const exportQueryAsJSON = document.querySelector('#exportQueryAsJSON');
        const exportEditorQuery = document.querySelector('#exportEditorQuery');
        const exportSampleDB=document.querySelector('#exportSampleDB');

        var firstQueryPageBtn, prevQueryPageBtn, currentQueryPageNo, nextQueryPageBtn, lastQueryPageBtn;

        const paginationBtnProps = {
            // // =====================
            'firstQueryPageBtn': {
                'className': 'page-item disabled',
                'linkClassName': 'page-link rounded-0 border-left border-top border-bottom border-right-0 font-weight-bolder',
                'linkTitle': 'first',
                'linkInnerText': '«' // ⏮
            },
            'prevQueryPageBtn': {
                'className': 'page-item disabled',
                'linkClassName': 'page-link rounded-0 border-left border-top border-bottom border-right-0 font-weight-bolder',
                'linkTitle': 'previous',
                'linkInnerText': '‹' // ⏪
            },
            'nextQueryPageBtn': {
                'className': 'page-item',
                'linkClassName': 'page-link rounded-0 border-right-0 font-weight-bolder',
                'linkTitle': 'next',
                'linkInnerText': '›' // ⏩
            },
            'lastQueryPageBtn': {
                'className': 'page-item',
                'linkClassName': 'page-link rounded-0 border font-weight-bolder',
                'linkTitle': 'last',
                'linkInnerText': '»' // ⏭
            }
        };

        async function initPaginationBtn(paginationBtnType, tablePaginationEle) {
            try {
                let paginationBtn = document.createElement('li');
                paginationBtn.id = paginationBtnType;
                paginationBtn.className = paginationBtnProps[paginationBtnType]['className'];

                let pageBtnLink = document.createElement('a');
                pageBtnLink.className = paginationBtnProps[paginationBtnType]['linkClassName'];
                pageBtnLink.setAttribute('title', paginationBtnProps[paginationBtnType]['linkTitle']);
                pageBtnLink.innerText = paginationBtnProps[paginationBtnType]['linkInnerText'];

                tablePaginationEle.appendChild(paginationBtn);
                paginationBtn.appendChild(pageBtnLink);

                return await Promise.resolve(paginationBtn);
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        async function initInputPageNo(tablePaginationEle, currentPageNoID, currentPageVal, noOfPagesVal) {
            try {
                let currentPageNoLi = document.createElement('li');
                currentPageNoLi.className = 'page-item';
                let currentPageNoLink = document.createElement('a');
                currentPageNoLink.className = 'page-link border-right-0';

                let currentPageNo = document.createElement('input');
                currentPageNo.id = currentPageNoID;
                currentPageNo.className = 'form-control form-control-sm rounded-0 pt-0 pb-0 pl-1 pr-0';
                currentPageNo.setAttribute('type', 'number');
                currentPageNo.value = currentPageVal;
                currentPageNo.setAttribute('min', 1);
                currentPageNo.setAttribute('max', noOfPagesVal);

                let boldTextPrefix = document.createElement('b');
                boldTextPrefix.className = 'pl-1 pr-1';
                boldTextPrefix.innerText = '/';

                let boldTextSuffix = document.createElement('b');
                boldTextSuffix.className = '';
                boldTextSuffix.innerText = noOfPagesVal;

                tablePaginationEle.appendChild(currentPageNoLi);
                currentPageNoLi.appendChild(currentPageNoLink);
                currentPageNoLink.appendChild(currentPageNo);
                currentPageNoLink.appendChild(boldTextPrefix);
                currentPageNoLink.appendChild(boldTextSuffix);

                return await Promise.resolve(currentPageNo);
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        function removeAllChildNodes(parent) {
            try {
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        function getResultSetAsRowJSON(_db, _sqlQuery) {
            try {
                let _resultset = _db.exec(_sqlQuery);
                let _columns = _resultset[0]['columns'];
                let _values = _resultset[0]['values'];
                let rowJSONOutput = [];
                for (let valArr of _values) {
                    let obj = {};
                    for (let v in valArr) {
                        obj[_columns[v]] = valArr[v];
                    }
                    rowJSONOutput.push(obj);
                }
                return rowJSONOutput;
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        async function renderDatatable(resultset, tableRecordsEle) {
            try {
                let status = await showLoadingSignal('Running SQL query');
                console.log(status);

                tableRecordsEle.innerHTML = '';
                errorDisplay.innerHTML = '';

                let tableHtmlStr = '';
                tableHtmlStr += '<table class="table table-striped table-condensed small table-bordered h-100 w-100">';
                tableHtmlStr += '<thead>';
                tableHtmlStr += '<tr><th></th><th>' + resultset[0]['columns'].join('</th><th>') + '</th></tr>';
                tableHtmlStr += '</thead>';
                tableHtmlStr += '<tbody>';
                let tableValues = resultset[0]['values'];
                for (let v in tableValues) {
                    tableHtmlStr += '<tr><th>' + (parseInt(v) + 1) + '</th><td>' + tableValues[v].join('</td><td>') + '</td></tr>';
                }
                tableHtmlStr += '</tbody>';
                tableHtmlStr += '</table>';
                tableHtmlStr += '</div>';
                tableRecordsEle.innerHTML = tableHtmlStr;

                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                siteModalInstance.hide();
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                return await Promise.resolve('success');
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } 
        }

        async function setQueryPaginationClass() {
            try {
                currentQueryPageNo.value = currentQueryPage;
                if (currentQueryPage == 1) {
                    if (!firstQueryPageBtn.classList.contains('disabled')) {
                        firstQueryPageBtn.classList.add('disabled');
                    }
                    if (!prevQueryPageBtn.classList.contains('disabled')) {
                        prevQueryPageBtn.classList.add('disabled');
                    }
                } else if (currentQueryPage > 1) {
                    if (firstQueryPageBtn.classList.contains('disabled')) {
                        firstQueryPageBtn.classList.remove('disabled');
                    }
                    if (prevQueryPageBtn.classList.contains('disabled')) {
                        prevQueryPageBtn.classList.remove('disabled');
                    }
                }
                if (currentQueryPage == noOfQueryPages) {
                    if (!nextQueryPageBtn.classList.contains('disabled')) {
                        nextQueryPageBtn.classList.add('disabled');
                    }
                    if (!lastQueryPageBtn.classList.contains('disabled')) {
                        lastQueryPageBtn.classList.add('disabled');
                    }
                } else if (currentQueryPage < noOfQueryPages) {
                    if (nextQueryPageBtn.classList.contains('disabled')) {
                        nextQueryPageBtn.classList.remove('disabled');
                    }
                    if (lastQueryPageBtn.classList.contains('disabled')) {
                        lastQueryPageBtn.classList.remove('disabled');
                    }
                }
                queryOffset = (currentQueryPage - 1) * recordsPerPage;
                queryStmt = 'SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
                queryResultset = db.exec(queryStmt);
                // console.log(['originalQueryStmt',originalQueryStmt]);
                // console.log(['queryStmt',queryStmt]);
                await renderDatatable(queryResultset, tableQueryRecords);
                codeEditor.value=queryStmt;

                displayedRecordsRange.innerHTML = `<span class='small text-muted'>Showing <strong>${queryOffset} to ${queryOffset+recordsPerPage}</strong> of <strong>${totalNoOfQueryRecords}</strong> rows</span>`;
                
                setQueryRecordsHeight();
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        function setQueryRecordsHeight() {
            const pageWrapper = mainWrapper.querySelector('.page-wrapper');
            const lineCounter = mainWrapper.querySelector('#lineCounter');
            const filters = mainWrapper.querySelector('#filters');
            const errorDisplay = mainWrapper.querySelector('#errorDisplay');

            let cssHeight = pageWrapper.clientHeight - (lineCounter.clientHeight + filters.clientHeight + errorDisplay.clientHeight + 31);
            tableQueryRecords['style']['height']=`calc(${cssHeight}px - 2rem)`;
        }

        function appendTableSelectable() {
            sqlQuery = 'SELECT name AS table_name FROM sqlite_master WHERE type =\'table\' AND name NOT LIKE \'sqlite_%\'';
            resultset = getResultSetAsRowJSON(db, sqlQuery);

            let noOfTables = resultset.length;
            noOfTablesDisplay.innerHTML = noOfTables;

            let allDisplayedTables={};
            for(var c of dbTableDetails.children) {
                let tbl=c.textContent;
                tbl=tbl.replace(tblIcon, '');
                allDisplayedTables[tbl]=true;
            }

            let displayedTablesArr=Object.keys(allDisplayedTables);
            for (let rowObj of resultset) {
                let tblName = rowObj['table_name']; // {table_name: 'icd9_mapping'}
                if(!displayedTablesArr.includes(tblName)) {
                    loadTableSelectable(tblName);
                }
            }
        }

        runQueryBtn.addEventListener('click', async(e) => {
            try {
                queryStmt = codeEditor.value;
                originalQueryStmt = queryStmt.trim();
                if (originalQueryStmt.charAt(originalQueryStmt.length - 1) == ';') {
                    originalQueryStmt = originalQueryStmt.substr(0, originalQueryStmt.length - 1);
                }
                // ================================================
                let toExec=true;
                try {
                    errorDisplay.innerHTML = '';
                    queryStmt = 'SELECT COUNT(*) FROM (' + originalQueryStmt + ')';
                    queryResultset = db.exec(queryStmt);
                } catch (err) {
                    toExec=false;
                }
                if(!toExec) {
                    db.run(originalQueryStmt);
                    appendTableSelectable();
                } else {
                    // ================================================
                    removeAllChildNodes(tableQueryPagination);
                    // ================================================
                    currentQueryPage = 1;
                    queryOffset = (currentQueryPage - 1) * recordsPerPage;
                    // ================================================
                    totalNoOfQueryRecords = queryResultset[0]['values'][0];
                    totalNoOfQueryRecords = parseInt(totalNoOfQueryRecords);
                    noOfQueryPages = totalNoOfQueryRecords / recordsPerPage;
                    noOfQueryPages = Math.ceil(noOfQueryPages);
                    // ================================================
                    displayedRecordsRange.innerHTML = `<span class='small text-muted'>Showing <strong>${queryOffset} to ${queryOffset+recordsPerPage}</strong> of <strong>${totalNoOfQueryRecords}</strong> rows</span>`;
                    // ================================================
                    firstQueryPageBtn = await initPaginationBtn('firstQueryPageBtn', tableQueryPagination);
                    // ================================================
                    prevQueryPageBtn = await initPaginationBtn('prevQueryPageBtn', tableQueryPagination);
                    // ================================================
                    currentQueryPageNo = await initInputPageNo(tableQueryPagination, 'currentQueryPageNo', currentQueryPage, noOfQueryPages);
                    // ================================================
                    nextQueryPageBtn = await initPaginationBtn('nextQueryPageBtn', tableQueryPagination);
                    // ================================================
                    lastQueryPageBtn = await initPaginationBtn('lastQueryPageBtn', tableQueryPagination);
                    // ================================================
                    // render datatable records
                    queryStmt = 'SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
                    queryResultset = db.exec(queryStmt);
                    // console.log(['originalQueryStmt',originalQueryStmt]);
                    // console.log(['queryStmt',queryStmt]);
                    await renderDatatable(queryResultset, tableQueryRecords);
                    codeEditor.value=queryStmt;

                    currentQueryPageNo.addEventListener('change', (evt0) => {
                        evt0.stopPropagation();
                        currentQueryPage = parseInt(evt0.target.value);
                        setQueryPaginationClass();
                    });
                    firstQueryPageBtn.addEventListener('click', (evt1) => {
                        evt1.stopPropagation();
                        currentQueryPage = 1;
                        setQueryPaginationClass();
                    });
                    prevQueryPageBtn.addEventListener('click', (evt2) => {
                        evt2.stopPropagation();
                        if (currentQueryPage > 1) {
                            currentQueryPage = currentQueryPage - 1;
                            setQueryPaginationClass();
                        }
                    });
                    nextQueryPageBtn.addEventListener('click', (evt3) => {
                        evt3.stopPropagation();
                        if (currentQueryPage < noOfQueryPages) {
                            currentQueryPage = currentQueryPage + 1;
                            setQueryPaginationClass();
                        }
                    });
                    lastQueryPageBtn.addEventListener('click', (evt4) => {
                        evt4.stopPropagation();
                        currentQueryPage = noOfQueryPages;
                        setQueryPaginationClass();
                    });
                }
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } 
        });


        exportQueryAsJSON.addEventListener('click', async() => {
            try {
                let status = await showLoadingSignal('Exporting data resultset');
                console.log(status);

                let jsonObj = getResultSetAsRowJSON(db, 'SELECT * FROM (' + originalQueryStmt + ')');
                let jsonStr = JSON.stringify(jsonObj);
                let textblob = new Blob([jsonStr], {
                    type: 'application/json'
                });
                let dwnlnk = document.createElement('a');
                dwnlnk.download = 'resultset.json';
                if (window.webkitURL != null) {
                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
                }
                dwnlnk.click();
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } finally {
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                siteModalInstance.hide();
            }
        });

        exportEditorQuery.addEventListener('click', async() => {
            try {
                let status = await showLoadingSignal('Saving SQL script');
                console.log(status);

                let queryStr = codeEditor.value;
                let textblob = new Blob([queryStr], {
                    type: 'text/plain'
                });
                let dwnlnk = document.createElement('a');
                dwnlnk.download = 'query.sql';
                if (window.webkitURL != null) {
                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
                }
                dwnlnk.click();
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } finally {
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                siteModalInstance.hide();
            }
        });

        exportSampleDB.addEventListener('click', async()=> {
            try {
                let status = await showLoadingSignal('Downloading sample database');
                console.log(status);

                let dwnlnk=document.createElement('a');
                dwnlnk.download = 'healthcare_records.db';
                dwnlnk.href = './database_files/healthcare_records.db';
                dwnlnk.click();
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } finally {
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                siteModalInstance.hide();
            }
        });

        function loadTableSelectable(tblName) {
            let tblClickableBtn = document.createElement('button');
            tblClickableBtn.setAttribute('type', 'button');
            tblClickableBtn.setAttribute('class', 'btn btn-sm btn-link border-left-0 border-right-0 border-top-0 border-custom-two rounded-0 datatable pt-2 pb-2 pr-3 pl-4');
            tblClickableBtn.innerHTML = `<span class='symbol mr-2'>${tblIcon}</span>${tblName}`;

            dbTableDetails.appendChild(tblClickableBtn);
            try {
                tblClickableBtn.addEventListener('click', async(e) => {
                    e.stopPropagation();

                    let selected_tbl_name = tblClickableBtn.innerText;
                    selected_tbl_name = selected_tbl_name.replace(tblIcon, '');
                    // ================================================
                    originalQueryStmt = 'SELECT COUNT(*) FROM `' + selected_tbl_name + '`';
                    queryStmt = originalQueryStmt;
                    queryResultset = db.exec(queryStmt);
                    // ================================================
                    removeAllChildNodes(tableQueryPagination);
                    // ================================================
                    currentQueryPage = 1;
                    queryOffset = (currentQueryPage - 1) * recordsPerPage;
                    // ================================================
                    totalNoOfQueryRecords = queryResultset[0]['values'][0];
                    totalNoOfQueryRecords = parseInt(totalNoOfQueryRecords);
                    noOfQueryPages = totalNoOfQueryRecords / recordsPerPage;
                    noOfQueryPages = Math.ceil(noOfQueryPages);
                    // ================================================
                    displayedRecordsRange.innerHTML = `<span class='small text-muted'>Showing <strong>${queryOffset} to ${queryOffset+recordsPerPage}</strong> of <strong>${totalNoOfQueryRecords}</strong> rows</span>`;
                    // ================================================
                    firstQueryPageBtn = await initPaginationBtn('firstQueryPageBtn', tableQueryPagination);
                    // ================================================
                    prevQueryPageBtn = await initPaginationBtn('prevQueryPageBtn', tableQueryPagination);
                    // ================================================
                    currentQueryPageNo = await initInputPageNo(tableQueryPagination, 'currentQueryPageNo', currentQueryPage, noOfQueryPages);
                    // ================================================
                    nextQueryPageBtn = await initPaginationBtn('nextQueryPageBtn', tableQueryPagination);
                    // ================================================
                    lastQueryPageBtn = await initPaginationBtn('lastQueryPageBtn', tableQueryPagination);
                    // ================================================
                    // render datatable records
                    originalQueryStmt = 'SELECT * FROM `' + selected_tbl_name + '`';
                    queryStmt = 'SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
                    queryResultset = db.exec(queryStmt);
                    // console.log(['originalQueryStmt',originalQueryStmt]);
                    // console.log(['queryStmt',queryStmt]);
                    await renderDatatable(queryResultset, tableQueryRecords);
                    codeEditor.value=queryStmt;

                    currentQueryPageNo.addEventListener('change', (evt0) => {
                        evt0.stopPropagation();
                        currentQueryPage = parseInt(evt0.target.value);
                        setQueryPaginationClass();
                    });
                    firstQueryPageBtn.addEventListener('click', (evt1) => {
                        evt1.stopPropagation();
                        currentQueryPage = 1;
                        setQueryPaginationClass();
                    });
                    prevQueryPageBtn.addEventListener('click', (evt2) => {
                        evt2.stopPropagation();
                        if (currentQueryPage > 1) {
                            currentQueryPage = currentQueryPage - 1;
                            setQueryPaginationClass();
                        }
                    });
                    nextQueryPageBtn.addEventListener('click', (evt3) => {
                        evt3.stopPropagation();
                        if (currentQueryPage < noOfQueryPages) {
                            currentQueryPage = currentQueryPage + 1;
                            setQueryPaginationClass();
                        }
                    });
                    lastQueryPageBtn.addEventListener('click', (evt4) => {
                        evt4.stopPropagation();
                        currentQueryPage = noOfQueryPages;
                        setQueryPaginationClass();
                    });
                });
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        function readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                let fileredr = new FileReader();
                fileredr.onload = () => resolve(fileredr.result);
                fileredr.onerror = () => reject(fileredr);
                fileredr.readAsArrayBuffer(file);
            });
        }
        const fileNameDisplay = document.querySelector('#fileNameDisplay');
        const fileSizeDisplay = document.querySelector('#fileSizeDisplay');

        const sidebarUpload = document.querySelector('#sidebarUpload');
        const upload = document.querySelector('#upload');

        upload.addEventListener('click', (ev) => {
            ev.currentTarget.value='';
        });
        sidebarUpload.addEventListener('click', () => {
            upload.click();
        });

        dropFileZone.addEventListener("dragenter", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropFileInnerZone.classList.add("bg-custom-two-05");
        });

        dropFileZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropFileInnerZone.classList.remove("bg-custom-two-05");
        });

        dropFileZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropFileInnerZone.classList.add("bg-custom-two-05");
        });

        async function importDBFile(file) {
            try {
                fileNameDisplay.innerText = file.name;
                fileSizeDisplay.innerText = `${parseInt(file.size/1024)} ㎅`;

                let arrayBuffer = await readFileAsArrayBuffer(file);
                let uInt8Array = new Uint8Array(arrayBuffer);
                db = new SQL.Database(uInt8Array);
                sqlQuery = 'SELECT name AS table_name FROM sqlite_master WHERE type =\'table\' AND name NOT LIKE \'sqlite_%\'';
                resultset = getResultSetAsRowJSON(db, sqlQuery);

                let noOfTables = resultset.length;
                noOfTablesDisplay.innerHTML = noOfTables;

                for (let rowObj of resultset) {
                    let tblName = rowObj['table_name']; // {table_name: 'icd9_mapping'}
                    loadTableSelectable(tblName);
                }
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            } finally {
                triggerEvent(infoModalBtn,'click');

                upload.setAttribute('disabled','');
                upload.classList.add('no-touch');
                upload.classList.add('unselectable');

                sidebarUpload.classList.add('no-touch');
                sidebarUpload.classList.add('unselectable');

                dropFileZone.setAttribute('hidden','');
                mainWrapper.removeAttribute('hidden');

                let tableTab=document.querySelector('details.accordion-item:not([open]):first-of-type .accordion-button');
                if(tableTab != null) {
                    tableTab.click();
                }
                triggerEvent(window,'resize');
            }
            return await Promise.resolve('success');
        }

        dropFileZone.addEventListener("drop", async(e) => {
            e.preventDefault();
            e.stopPropagation();
            dropFileInnerZone.classList.remove("bg-custom-two-05");

            errorDisplay.innerHTML = '';
            upload.value='';
            
            let draggedData = e.dataTransfer;
            let file = draggedData.files[0];
            if (!file) return;

            await importDBFile(file);
            let initTable=document.querySelector('#dbTableDetails.accordion-body:first-of-type button.datatable');
            if(initTable != null) {
                initTable.click();
            }
        }); // drop file change event

        upload.addEventListener('change', async(ev) => {
            errorDisplay.innerHTML = '';

            let file = ev.currentTarget.files[0];
            if (!file) return;

            await importDBFile(file);
            let initTable=document.querySelector('#dbTableDetails.accordion-body:first-of-type button.datatable');
            if(initTable != null) {
                initTable.click();
            }
        }); // upload file change event
        
        const convertBitArrtoB64 = (bitArr) => ( btoa( bitArr.reduce((data, byte) => data + String.fromCharCode(byte), '') ) );
        const exportDB=document.querySelector('#exportDB');
        exportDB.addEventListener('click', async(evt)=> {
            try {
                let status = await showLoadingSignal('Exporting database');
                console.log(status);

                const arrayBuffer = db.export();
                let uInt8Array=new Uint8Array(arrayBuffer);
                let b64Str=convertBitArrtoB64(uInt8Array);

                let dwnlnk = document.createElement('a');
                dwnlnk.download = `exported_${fileNameDisplay.innerText}`;
                dwnlnk.href=`data:application/x-sqlite3;base64,${b64Str}`;
                dwnlnk.click();
            } catch (err) {
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
           } finally {
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                siteModalInstance.hide();
            }
        });

        // Prepare an sql statement
        // sqlQuery="WITH tables AS \n" +
        // "(SELECT name, sql FROM sqlite_master \n" +
        // "WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name='"+ tblName +"')\n" +
        // "SELECT cid,fields.name FROM tables \n" +
        // "CROSS JOIN pragma_table_info(tables.name) fields";
        // console.log(sqlQuery);
        // stmt = db.prepare(sqlQuery);
        // resultset = db.exec(sqlQuery);
        // console.log(resultset);
        // Bind values to the parameters and fetch the results of the query
        // resultObj = stmt.getAsObject({':tblNameVal' : tblName});
        // console.log(resultObj); // Will print {a:1, b:'world'}
        // free the memory used by the statement
        // stmt.free();
        // ================================== Query Editor Tab ===========================
        const sampleQueryStmt = 'SELECT patient_id,diagnosis_code,icd9_description FROM' +
             '\n  (SELECT patient_id,diagnosis_code FROM patient_diagnosis) A' + 
             '\nLEFT JOIN ' +
             '\n  (SELECT icd9_code, icd9_description FROM icd9_mapping) B' +
             '\nON A.diagnosis_code = B.icd9_code;';

        function line_counter(codeEditor, lineCounter) {
            const codeEditorWidth=codeEditor.clientWidth;
            const lineCounterWidth=lineCounter.clientWidth;

            const codeEditorLeftPadding = 5; // padding-left = 5 of #codeEditor
            const codeEditorEditableWidth=codeEditorWidth-lineCounterWidth-codeEditorLeftPadding; 

            let lines = codeEditor.value.split('\n');
            let lineCount = lines.length;
            let outarr = new Array();
            for (let x = 0; x < lineCount; x++) {
                if ((lines[x].length * 8) + codeEditorLeftPadding > codeEditorEditableWidth) {
                    outarr.push(`${parseInt(x + 1)}.`);
                    let nbWrap = Math.floor(((lines[x].length * 8) + codeEditorLeftPadding) / codeEditorEditableWidth);
                    for (let y = 0; y < nbWrap; y++) {
                        outarr.push(' ');
                    }
                } else {
                    outarr.push(`${parseInt(x + 1)}.`);
                }
            }
            lineCounter.value = outarr.join('\n');
        }
        function bindEventsToCodeEditor(codeEditor, lineCounter) {
             codeEditor.addEventListener('scroll', () => {
                lineCounter.scrollTop = codeEditor.scrollTop;
                lineCounter.scrollLeft = codeEditor.scrollLeft;
            });
            codeEditor.addEventListener('input', () => {
                line_counter(codeEditor, lineCounter);
            });
            codeEditor.addEventListener('keydown', (e) => {
                let { keyCode } = e;
                let {
                    value,
                    selectionStart,
                    selectionEnd
                } = codeEditor;
                if (keyCode === 9) {
                    e.preventDefault();
                    codeEditor.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
                    codeEditor.setSelectionRange(selectionStart + 2, selectionStart + 1)
                }
            });
        }
        // codeEditor.value = sampleQueryStmt;
        // line_counter(codeEditor, lineCounter);

        window.addEventListener('resize', (evt)=> {
            let w=window.innerWidth;
            if(w<720) {
                toggleSidebarBtn.value=false;
            } else {
                toggleSidebarBtn.value=true;
            }
            triggerEvent(toggleSidebarBtn,'click');
            setQueryRecordsHeight();

            const codeEditor=document.querySelector('#codeEditor');
            const lineCounter=document.querySelector('#lineCounter');
            line_counter(codeEditor, lineCounter);
            bindEventsToCodeEditor(codeEditor, lineCounter);
        });
        triggerEvent(window,'resize');

    }); // DOMContentLoaded
}

