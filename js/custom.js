if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    callback();
} else {
    document.addEventListener('DOMContentLoaded', async() => {
        console.log('DOMContentLoaded');

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


        const toggleSidebarBtn = document.querySelector('#toggleSidebarBtn');
        const asideLeftSidebar = document.querySelector('aside.left-sidebar');
        const pageWrapper = document.querySelector('#main-wrapper .page-wrapper');
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
        


        function htmlToElement(html) {
            let documentFragment = document.createDocumentFragment();
            let template = document.createElement('template');
            template.innerHTML = html.trim();
            for (let i = 0, e = template.content.childNodes.length; i < e; i++) {
                documentFragment.appendChild(template.content.childNodes[i].cloneNode(true));
            }
            return documentFragment;
        }

        const sidebarUpload = document.querySelector('#sidebarUpload');
        const upload = document.querySelector('#upload');
        upload.addEventListener('click', (ev) => {
            ev.currentTarget.value='';
        });
        sidebarUpload.addEventListener('click', () => {
            upload.click();
        });

        const infoModalBtn = document.querySelector('#infoModalBtn');
        const myModalInstance = new BSN.Modal(
          '#siteModal', { 
            content: `<div class="modal-header">
                        <h5 class="modal-title"><span class='icon icon-info p-2 mr-2'></span> About SQLite Browser Tool</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                      </div>
                      <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-12" style="text-align:left">
                                <p><span class="symbol">➊</span> Original work by Kripken <cite title="sql.js/sql.js: A javascript library to run SQLite on the web."><a href="https://github.com/sql-js/sql.js" target="_blank">sql.js</a></cite> which is <a href="LICENSE.txt" target="_blank">MIT licensed</a>.</p>
                                <p><span class="symbol">➋</span> SQLite is a <abbr title="Relational Database Management System">RDBMS</abbr> with no dependencies and able to operate offline in-browser without a database engine.</p>
                                <p><span class="symbol">➌</span> <span class="emoji">🚫</span> No server-side processing <span class='symbol'>⇒</span> No server setup required.</p>
                                <p><span class="symbol">➍</span> <span class="emoji">📱</span> Mobile-responsive and works on JavaScript-enabled mobile web browsers.</p>
                            </div>
                        </div>
                      </div>
                      <div class="modal-footer text-right">
                        <small><span class='symbol pl-1 pr-1'>— Created by</span><a href="https://medium.com/@geek-cc" target="_blank"><span class="symbol">ξ(</span><span class="emoji">🎀</span><span class="symbol">˶❛◡❛) ᵀᴴᴱ ᴿᴵᴮᴮᴼᴺ ᴳᴵᴿᴸ</span>
                        </a></small><span class='symbol pl-1 pr-1'><a href='https://github.com/incubated-geek-cc/' target='_blank'><span data-profile='github' class='attribution-icon'></span></a> ▪ <a href='https://medium.com/@geek-cc' target='_blank'><span data-profile='medium' class='attribution-icon'></span></a> ▪ <a href='https://www.linkedin.com/in/charmaine-chui-15133282/' target='_blank'><span data-profile='linkedin' class='attribution-icon'></span></a> ▪ <a href='https://twitter.com/IncubatedGeekCC' target='_blank'><span data-profile='twitter' class='attribution-icon'></span></a></span>
                      </div>`,
            backdrop: true,
            keyboard: true
          }
        );

        infoModalBtn.addEventListener('click', ()=>{
            myModalInstance.toggle();
        });
        triggerEvent(infoModalBtn,'click');

        const displayedRecordsRange = document.querySelector('#displayedRecordsRange');
        const noOfTablesDisplay = document.querySelector('#noOfTablesDisplay');

        const dbTableDetails = document.querySelector('#dbTableDetails');
        const errorDisplay = document.querySelector('#errorDisplay');

        const codeEditor = document.querySelector('#codeEditor');
        const lineCounter = document.querySelector('#lineCounter');
        const filters = document.querySelector('#filters');

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
                errorDisplay.innerHTML = '';
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
                errorDisplay.innerHTML = '';
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
                errorDisplay.innerHTML = '';
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
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }
        async function renderDatatable(resultset, tableRecordsEle) {
            try {
                tableRecordsEle.innerHTML = '';

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

                errorDisplay.innerHTML = '';

                return await Promise.resolve('success');
            } catch (err) {
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }
        
        function setQueryRecordsHeight() {
            let cssHeight = pageWrapper.clientHeight - (lineCounter.clientHeight + filters.clientHeight + errorDisplay.clientHeight + 31);
            tableQueryRecords['style']['height']=`calc(${cssHeight}px - 1rem)`;
        }

        window.addEventListener('resize', (evt)=> {
            let w=window.innerWidth;
            if(w<720) {
                toggleSidebarBtn.value=false;
            } else {
                toggleSidebarBtn.value=true;
            }
            triggerEvent(toggleSidebarBtn,'click');
            setQueryRecordsHeight();
        });
        triggerEvent(window,'resize');

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

                displayedRecordsRange.innerHTML = `<span class='small text-muted'>Showing <strong>${queryOffset} to ${queryOffset+recordsPerPage}</strong> of <strong>${totalNoOfQueryRecords}</strong> rows</span>`;

                setQueryRecordsHeight();
            } catch (err) {
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        }

        const runQueryBtn = document.querySelector('#runQueryBtn');
        runQueryBtn.addEventListener('click', async(e) => {
            try {
                queryStmt = codeEditor.value;
                originalQueryStmt = queryStmt.trim();
                if (originalQueryStmt.charAt(originalQueryStmt.length - 1) == ';') {
                    originalQueryStmt = originalQueryStmt.substr(0, originalQueryStmt.length - 1);
                }
                // ================================================
                queryStmt = 'SELECT COUNT(*) FROM (' + originalQueryStmt + ')';
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
                queryStmt = 'SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
                queryResultset = db.exec(queryStmt);
                // console.log(['originalQueryStmt',originalQueryStmt]);
                // console.log(['queryStmt',queryStmt]);
                await renderDatatable(queryResultset, tableQueryRecords);

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
            } catch (err) {
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        });

        exportQueryAsJSON.addEventListener('click', () => {
            try {
                let jsonObj = getResultSetAsRowJSON(db, 'SELECT * FROM (' + originalQueryStmt + ')');
                let jsonStr = JSON.stringify(jsonObj);
                let textblob = new Blob([jsonStr], {
                    type: 'application/json'
                });
                let dwnlnk = document.createElement('a');
                dwnlnk.download = 'queryResultset.json';
                if (window.webkitURL != null) {
                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
                }
                dwnlnk.click();
            } catch (err) {
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        });

        exportEditorQuery.addEventListener('click', () => {
            try {
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
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }
        });


        function loadTableSelectable(tblName) {
            let tblClickableBtn = document.createElement('button');
            tblClickableBtn.setAttribute('type', 'button');
            tblClickableBtn.setAttribute('class', 'btn btn-sm btn-link border-left-0 border-right-0 border-top-0 border-custom-two rounded-0 datatable pt-2 pb-2 pr-3 pl-3');
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
                errorDisplay.innerHTML = '';
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
        // const binaryArray = db.export();
        const fileNameDisplay = document.querySelector('#fileNameDisplay');
        const fileSizeDisplay = document.querySelector('#fileSizeDisplay');
        upload.addEventListener('change', async(ev) => {
            errorDisplay.innerHTML = '';

            let file = ev.currentTarget.files[0];
            if (!file) return;

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
                errorDisplay.innerHTML = '';
                errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
                console.log(err);
            }

            // const convertBitArrtoB64 = (bitArr) => ( btoa( bitArr.reduce((data, byte) => data + String.fromCharCode(byte), '') ) );

            // const exportDB=document.querySelector('#exportDB');
            // exportDB.addEventListener('click', (evt)=> {
            // 	const arrayBuffer = db.export();
            // 	let uInt8Array=new Uint8Array(arrayBuffer);
            // 	let b64Str=convertBitArrtoB64(uInt8Array);

            // 	let dwnlnk = document.createElement('a');
            //  dwnlnk.download = 'sqliteDatabaseOutput.db';
            //  dwnlnk.href=`data:application/db;base64,${b64Str}`;
            //  dwnlnk.click();
            // });
        }); // upload file change event
        const exportSampleDB=document.querySelector('#exportSampleDB');
        exportSampleDB.addEventListener('click', (evt)=> {
            let dwnlnk=document.createElement('a');
            dwnlnk.download = 'healthcare_records.db';
            dwnlnk.href = './database_files/healthcare_records.db';
            dwnlnk.click();
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
        const sampleQueryStmt = 'SELECT patient_id,diagnosis_code,icd9_description' +
            '\n FROM' +
            '\n (SELECT' +
            '\n     patient_id,' +
            '\n     diagnosis_code' +
            '\n FROM patient_diagnosis) A LEFT JOIN ' +
            '\n (SELECT icd9_code, icd9_description FROM icd9_mapping) B' +
            '\n ON A.diagnosis_code = B.icd9_code;';

        var _buffer;
        function countLines(textarea) {
            if (_buffer == null) {
                _buffer = document.createElement('textarea');
                _buffer.style.border = 'none';
                _buffer.style.height = '0';
                _buffer.style.overflow = 'hidden';
                _buffer.style.padding = '0';
                _buffer.style.position = 'absolute';
                _buffer.style.left = '0';
                _buffer.style.top = '0';
                _buffer.style.zIndex = '-1';
                document.body.appendChild(_buffer);
            }
            let cs = window.getComputedStyle(textarea);
            let pl = parseInt(cs.paddingLeft);
            let pr = parseInt(cs.paddingRight);
            let lh = parseInt(cs.lineHeight);
            if (isNaN(lh)) lh = parseInt(cs.fontSize);
            _buffer.style.width = (textarea.clientWidth - pl - pr) + 'px';
            _buffer.style.font = cs.font;
            _buffer.style.letterSpacing = cs.letterSpacing;
            _buffer.style.whiteSpace = cs.whiteSpace;
            _buffer.style.wordBreak = cs.wordBreak;
            _buffer.style.wordSpacing = cs.wordSpacing;
            _buffer.style.wordWrap = cs.wordWrap;

            _buffer.value = textarea.value;

            let result = Math.floor(_buffer.scrollHeight / lh);
            if (result == 0) result = 1;
            return result;
        }
        var onFirstLoad = true;
        var lineCountCache = 0;
        var outArrCache = new Array();
        async function line_counter() {
            let lineCount = codeEditor.value.split('\n').length;
            let outarr = new Array();
            for (var x = 0; x < lineCount; x++) {
                outarr[x] = (x + 1) + '.';
            }
            await Promise.resolve(outarr);
            lineCountCache = lineCount;
            lineCounter.value = outarr.join('\n');
        }
        codeEditor.addEventListener('scroll', () => {
            lineCounter.scrollTop = codeEditor.scrollTop;
            lineCounter.scrollLeft = codeEditor.scrollLeft;
        });
        codeEditor.addEventListener('input', () => {
            line_counter();
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
        codeEditor.value = sampleQueryStmt;
        line_counter();

    }); // DOMContentLoaded
}

