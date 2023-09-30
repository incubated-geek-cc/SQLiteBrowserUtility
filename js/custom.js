if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
	callback();
} else {
	document.addEventListener('DOMContentLoaded', async() => {
	    console.log('DOMContentLoaded');

	    const copyrightYearDisplay=document.querySelector('#copyrightYearDisplay');
	    copyrightYearDisplay.innerHTML=new Date().getFullYear();

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
	    		errorDisplay.innerHTML='<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'FileReader\' function required to open a file.';
	  		return;
			}
			if (!window.Blob) {
	        	errorDisplay.innerHTML='<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'Blob\' function required to save a file.';
	  		return;
		}
			
		const toggleSidebarBtn = document.querySelector('#toggleSidebarBtn');
	    const asideLeftSidebar = document.querySelector('aside.left-sidebar');
	    const pageWrapper = document.querySelector('#main-wrapper .page-wrapper');
	    // const pageWrapperContainer = document.querySelector('#main-wrapper .page-wrapper >.container-fluid');
	    toggleSidebarBtn.addEventListener('click', (evt) => {
	        let currentVal = evt.target.value;
	        let latestVal = (currentVal == 'true') ? 'false' : 'true';
	        toggleSidebarBtn.value = latestVal;
	        if (latestVal == 'true') {
	            asideLeftSidebar['style']['width'] = '0px';
	            pageWrapper['style']['margin-left'] = '0px';
	            // pageWrapperContainer['style']['min-width'] = 'calc(100vw - 5.5em)';
	        } else if (latestVal == 'false') {
	            asideLeftSidebar['style']['width'] = '240px';
	            pageWrapper['style']['margin-left'] = '240px';
	            // pageWrapperContainer['style']['min-width'] = 'calc(100vw - 240px - 5.5em)';
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

	    const uploadBtn=document.querySelector('#upload-btn');
			const upload=document.querySelector('#upload');
			uploadBtn.addEventListener('click', () => {
				let clickEvent = new MouseEvent('click', { view: window, bubbles: false, cancelable: false });
			upload.dispatchEvent(clickEvent);
		});

		const displayedRecordsRange=document.querySelector('#displayedRecordsRange');
		const noOfTablesDisplay=document.querySelector('#noOfTablesDisplay');
		const totalRowCount=document.querySelector('#totalRowCount');
		const pageCountDisplay=document.querySelector('#pageCountDisplay');

		const dbTableDetails=document.querySelector('#dbTableDetails');
		const errorDisplay=document.querySelector('#errorDisplay');

		var db=null;

		const tblIcon='▦ ';				
		const nil='---';
		const recordsPerPage=100;
		// =============== QUERY TAB =============================
		var queryStmt='';
		var queryResultset=[];

		var currentQueryPage=1;
		var originalQueryStmt='';
		var noOfQueryPages=1;
		var totalNoOfQueryRecords=0;
		var queryOffset=0;

		const tableQueryRecords=document.querySelector('#tableQueryRecords');
		const tableQueryPagination=document.querySelector('#tableQueryPagination');

		const exportQueryAsJSON=document.querySelector('#exportQueryAsJSON');
		const exportEditorQuery=document.querySelector('#exportEditorQuery');

		var firstQueryPageBtn, prevQueryPageBtn, currentQueryPageNo, nextQueryPageBtn, lastQueryPageBtn;

		const paginationBtnProps={
			// // =====================
			'firstQueryPageBtn': {
				'className':'page-item disabled',
				'linkClassName':'page-link rounded-0 border',
				'linkTitle':'first',
				'linkInnerText':'⏮'
			},
			'prevQueryPageBtn': {
				'className':'page-item disabled',
				'linkClassName':'page-link rounded-0 border',
				'linkTitle':'previous',
				'linkInnerText':'⏪'
			},
			'nextQueryPageBtn': {
				'className':'page-item',
				'linkClassName':'page-link rounded-0 border',
				'linkTitle':'next',
				'linkInnerText':'⏩'
			},
			'lastQueryPageBtn': {
				'className':'page-item',
				'linkClassName':'page-link rounded-0 border',
				'linkTitle':'last',
				'linkInnerText':'⏭'
			}
		};

		async function initPaginationBtn(paginationBtnType, tablePaginationEle) {
			try {
				let paginationBtn=document.createElement('li');
				paginationBtn.id=paginationBtnType;
				paginationBtn.className=paginationBtnProps[paginationBtnType]['className'];

				let pageBtnLink=document.createElement('a');
				pageBtnLink.className=paginationBtnProps[paginationBtnType]['linkClassName'];
				pageBtnLink.setAttribute('title', paginationBtnProps[paginationBtnType]['linkTitle']);
				pageBtnLink.innerText=paginationBtnProps[paginationBtnType]['linkInnerText'];

				tablePaginationEle.appendChild(paginationBtn);
				paginationBtn.appendChild(pageBtnLink);

				return await Promise.resolve(paginationBtn);
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}
		
		async function initInputPageNo(tablePaginationEle,currentPageNoID,currentPageVal,noOfPagesVal) {
			try {
				let currentPageNoLI=document.createElement('li');
				currentPageNoLI.className='page-item';
				let currentPageNoLink=document.createElement('a');
				currentPageNoLink.className='page-link';

				let currentPageNo=document.createElement('input');
				currentPageNo.id=currentPageNoID;
				currentPageNo.className='form-control form-control-sm rounded-0';
				currentPageNo.setAttribute('type','number');
				currentPageNo.value=currentPageVal;
				currentPageNo.setAttribute('min',1);
				currentPageNo.setAttribute('max',noOfPagesVal);

				let boldTextPrefix=document.createElement('b');
				boldTextPrefix.className='pl-1 pr-1';
				boldTextPrefix.innerText='/';

				let boldTextSuffix=document.createElement('b');
				boldTextSuffix.className='pl-1 pr-1';
				boldTextSuffix.innerText=noOfPagesVal;
				pageCountDisplay.innerText=noOfPagesVal;

				tablePaginationEle.appendChild(currentPageNoLI);
				currentPageNoLI.appendChild(currentPageNoLink);
				currentPageNoLink.appendChild(currentPageNo);
				currentPageNoLink.appendChild(boldTextPrefix);
				currentPageNoLink.appendChild(boldTextSuffix);

				return await Promise.resolve(currentPageNo);
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}
		function removeAllChildNodes(parent) {
			try {
			    while (parent.firstChild) {
			        parent.removeChild(parent.firstChild);
			    }
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}
		function loadTableSelectable(tblName) {
			let tblClickableBtn=document.createElement('button');
			tblClickableBtn.setAttribute('type','button');
			tblClickableBtn.setAttribute('class','btn btn-sm btn-link rounded-0 datatable');
			tblClickableBtn.innerText=`${tblIcon}${tblName}`;

			let tblClickableRow=dbTableDetails.insertRow(0);
			let tblClickableCell=tblClickableRow.insertCell(0);
			tblClickableCell.setAttribute('colspan',2);

			tblClickableCell.appendChild(tblClickableBtn);

			try {
				tblClickableBtn.addEventListener('click', async(e) => {
					e.stopPropagation();

					let selected_tbl_name=tblClickableBtn.innerText;
					selected_tbl_name=selected_tbl_name.replace(tblIcon,'');
					// ================================================
					originalQueryStmt='SELECT COUNT(*) FROM `' + selected_tbl_name + '`';
					queryStmt=originalQueryStmt;
					queryResultset = db.exec(queryStmt);
					// ================================================
					removeAllChildNodes(tableQueryPagination);
					// ================================================
					currentQueryPage=1;
					queryOffset=(currentQueryPage-1)*recordsPerPage;
					// ================================================
					totalNoOfQueryRecords=queryResultset[0]['values'][0];
					totalNoOfQueryRecords=parseInt(totalNoOfQueryRecords);
					noOfQueryPages=totalNoOfQueryRecords/recordsPerPage;
					noOfQueryPages=Math.ceil(noOfQueryPages);
					// ================================================
					totalRowCount.innerHTML=totalNoOfQueryRecords;
					displayedRecordsRange.innerHTML=`${queryOffset} ― ${queryOffset+recordsPerPage}`;
					// ================================================
					firstQueryPageBtn=await initPaginationBtn('firstQueryPageBtn',tableQueryPagination);
					// ================================================
					prevQueryPageBtn=await initPaginationBtn('prevQueryPageBtn',tableQueryPagination);
					// ================================================
					currentQueryPageNo=await initInputPageNo(tableQueryPagination,'currentQueryPageNo',currentQueryPage,noOfQueryPages);
					// ================================================
					nextQueryPageBtn=await initPaginationBtn('nextQueryPageBtn',tableQueryPagination);
					// ================================================
					lastQueryPageBtn=await initPaginationBtn('lastQueryPageBtn',tableQueryPagination);
					// ================================================
					// render datatable records
					originalQueryStmt='SELECT * FROM `' + selected_tbl_name + '`';
					queryStmt='SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
					queryResultset = db.exec(queryStmt);
					// console.log(['originalQueryStmt',originalQueryStmt]);
					// console.log(['queryStmt',queryStmt]);
					await renderDatatable(queryResultset,tableQueryRecords);

					currentQueryPageNo.addEventListener('change', (evt0) => {
						evt0.stopPropagation();
						currentQueryPage=parseInt(evt0.target.value);
						setQueryPaginationClass();
					});
					firstQueryPageBtn.addEventListener('click', (evt1) => {
						evt1.stopPropagation();
						currentQueryPage=1;
						setQueryPaginationClass();
					});
					prevQueryPageBtn.addEventListener('click', (evt2) => {
						evt2.stopPropagation();
						if(currentQueryPage>1) {
							currentQueryPage=currentQueryPage-1;
							setQueryPaginationClass();
						}
					});
					nextQueryPageBtn.addEventListener('click', (evt3) => {
						evt3.stopPropagation();
						if(currentQueryPage<noOfQueryPages) {
							currentQueryPage=currentQueryPage+1;
							setQueryPaginationClass();
						}
					});
					lastQueryPageBtn.addEventListener('click', (evt4) => {
						evt4.stopPropagation();
						currentQueryPage=noOfQueryPages;
						setQueryPaginationClass();
					});
				});
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}
		function getResultSetAsRowJSON(_db, _sqlQuery) {
			try {
				let _resultset = _db.exec(_sqlQuery);
				let _columns=_resultset[0]['columns'];
				let _values=_resultset[0]['values'];
				let rowJSONOutput=[];
				for(let valArr of _values) {
					let obj={};
					for(let v in valArr) { obj[_columns[v]]=valArr[v]; }
					rowJSONOutput.push(obj);
				}
				return rowJSONOutput;
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}
		async function renderDatatable(resultset, tableRecordsEle) {
			try {
	        	tableRecordsEle.innerHTML='';

	        	let tableHtmlStr='';
				tableHtmlStr+='<table class="table table-striped table-condensed small table-bordered">';
				tableHtmlStr+='<thead>';
				tableHtmlStr+='<tr><th></th><th>'+resultset[0]['columns'].join('</th><th>')+'</th></tr>';
				tableHtmlStr+='</thead>';
				tableHtmlStr+='<tbody>';
				let tableValues=resultset[0]['values'];
				for(let v in tableValues) {
					tableHtmlStr+='<tr><th>' + (parseInt(v)+1) + '</th><td>'+tableValues[v].join('</td><td>') + '</td></tr>';
				}
				tableHtmlStr+='</tbody>';
				tableHtmlStr+='</table>';
				tableHtmlStr+='</div>';
				tableRecordsEle.innerHTML=tableHtmlStr;

				errorDisplay.innerHTML='';

				return await Promise.resolve('success');
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
	    }
	    // ================================== Query Editor Tab ===========================
	    var sampleQueryStmt='SELECT patient_id,diagnosis_code,icd9_description'
				+'\n FROM'
				+'\n (SELECT'
				+'\n 	patient_id,'
				+'\n 	diagnosis_code'
				+'\n FROM patient_diagnosis) A LEFT JOIN '
				+'\n (SELECT icd9_code, icd9_description FROM icd9_mapping) B'
				+'\n ON A.diagnosis_code = B.icd9_code;';
			const codeEditor = document.querySelector('#codeEditor');
		const lineCounter = document.querySelector('#lineCounter');

		var _buffer;
		function countLines(textarea) {
			if(_buffer==null) {
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
		var onFirstLoad=true;
		var lineCountCache=0;
		var outArrCache=new Array();
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
		    let { value, selectionStart, selectionEnd } = codeEditor;
		    if (keyCode === 9) {
		      e.preventDefault();
		      codeEditor.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
		      codeEditor.setSelectionRange(selectionStart+2, selectionStart+1)
		    }
	  	});
	  	codeEditor.value = sampleQueryStmt;
	  	line_counter();

		async function setQueryPaginationClass() {
			try {
				currentQueryPageNo.value=currentQueryPage;
				if(currentQueryPage==1) {
					if(!firstQueryPageBtn.classList.contains('disabled')) {
						firstQueryPageBtn.classList.add('disabled');
					}
					if(!prevQueryPageBtn.classList.contains('disabled')) {
						prevQueryPageBtn.classList.add('disabled');
					}
				} else if(currentQueryPage>1) {
					if(firstQueryPageBtn.classList.contains('disabled')) {
						firstQueryPageBtn.classList.remove('disabled');
					}
					if(prevQueryPageBtn.classList.contains('disabled')) {
						prevQueryPageBtn.classList.remove('disabled');
					}
				}
				if(currentQueryPage==noOfQueryPages) {
					if(!nextQueryPageBtn.classList.contains('disabled')) {
						nextQueryPageBtn.classList.add('disabled');
					}
					if(!lastQueryPageBtn.classList.contains('disabled')) {
						lastQueryPageBtn.classList.add('disabled');
					}
				} else if(currentQueryPage<noOfQueryPages) {
					if(nextQueryPageBtn.classList.contains('disabled')) {
						nextQueryPageBtn.classList.remove('disabled');
					}
					if(lastQueryPageBtn.classList.contains('disabled')) {
						lastQueryPageBtn.classList.remove('disabled');
					}
				}
				queryOffset=(currentQueryPage-1)*recordsPerPage;
				queryStmt='SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
				queryResultset = db.exec(queryStmt);
				// console.log(['originalQueryStmt',originalQueryStmt]);
				// console.log(['queryStmt',queryStmt]);
				await renderDatatable(queryResultset,tableQueryRecords);

				totalRowCount.innerHTML=totalNoOfQueryRecords;
				displayedRecordsRange.innerHTML=`${queryOffset} ― ${queryOffset+recordsPerPage}`;
			} catch(err) {
				errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
			}
		}

	  	const runQueryBtn=document.querySelector('#runQueryBtn');
	  	runQueryBtn.addEventListener('click', async(e) => {
	  		try {
	  			queryStmt=codeEditor.value;
	  			originalQueryStmt=queryStmt.trim();
				if(originalQueryStmt.charAt(originalQueryStmt.length-1)==';') {
					originalQueryStmt=originalQueryStmt.substr(0,originalQueryStmt.length-1);
				}
		  		// ================================================
				queryStmt='SELECT COUNT(*) FROM (' + originalQueryStmt + ')';
				queryResultset=db.exec(queryStmt);
				// ================================================
				removeAllChildNodes(tableQueryPagination);
				// ================================================
				currentQueryPage=1;
				queryOffset=(currentQueryPage-1)*recordsPerPage;
				// ================================================
				totalNoOfQueryRecords=queryResultset[0]['values'][0];
				totalNoOfQueryRecords=parseInt(totalNoOfQueryRecords);
				noOfQueryPages=totalNoOfQueryRecords/recordsPerPage;
				noOfQueryPages=Math.ceil(noOfQueryPages);
				// ================================================
				totalRowCount.innerHTML=totalNoOfQueryRecords;
				displayedRecordsRange.innerHTML=`${queryOffset} ― ${queryOffset+recordsPerPage}`;
				// ================================================
				firstQueryPageBtn=await initPaginationBtn('firstQueryPageBtn',tableQueryPagination);
				// ================================================
				prevQueryPageBtn=await initPaginationBtn('prevQueryPageBtn',tableQueryPagination);
				// ================================================
				currentQueryPageNo=await initInputPageNo(tableQueryPagination,'currentQueryPageNo',currentQueryPage,noOfQueryPages);
				// ================================================
				nextQueryPageBtn=await initPaginationBtn('nextQueryPageBtn',tableQueryPagination);
				// ================================================
				lastQueryPageBtn=await initPaginationBtn('lastQueryPageBtn',tableQueryPagination);
				// ================================================
				// render datatable records
				queryStmt='SELECT * FROM (' + originalQueryStmt + ') LIMIT ' + queryOffset + ',' + recordsPerPage;
				queryResultset = db.exec(queryStmt);
				// console.log(['originalQueryStmt',originalQueryStmt]);
				// console.log(['queryStmt',queryStmt]);
				await renderDatatable(queryResultset,tableQueryRecords);

				currentQueryPageNo.addEventListener('change', (evt0) => {
					evt0.stopPropagation();
					currentQueryPage=parseInt(evt0.target.value);
					setQueryPaginationClass();
				});
				firstQueryPageBtn.addEventListener('click', (evt1) => {
					evt1.stopPropagation();
					currentQueryPage=1;
					setQueryPaginationClass();
				});
				prevQueryPageBtn.addEventListener('click', (evt2) => {
					evt2.stopPropagation();
					if(currentQueryPage>1) {
						currentQueryPage=currentQueryPage-1;
						setQueryPaginationClass();
					}
				});
				nextQueryPageBtn.addEventListener('click', (evt3) => {
					evt3.stopPropagation();
					if(currentQueryPage<noOfQueryPages) {
						currentQueryPage=currentQueryPage+1;
						setQueryPaginationClass();
					}
				});
				lastQueryPageBtn.addEventListener('click', (evt4) => {
					evt4.stopPropagation();
					currentQueryPage=noOfQueryPages;
					setQueryPaginationClass();
				});
		  	} catch(err) {
		  		errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
		  	}
	  	});

		exportQueryAsJSON.addEventListener('click', () => {
			try {
				let jsonObj=getResultSetAsRowJSON(db, 'SELECT * FROM (' + originalQueryStmt + ')');
		    	let jsonStr=JSON.stringify(jsonObj);
		        let textblob = new Blob([jsonStr], {
		            type: 'application/json'
		        });
		        let dwnlnk = document.createElement('a');
		        dwnlnk.download = 'queryResultset.json';
		        if (window.webkitURL != null) { dwnlnk.href = window.webkitURL.createObjectURL(textblob); }
		        dwnlnk.click();
		    } catch(err) {
		    	errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
		    }
		});

		exportEditorQuery.addEventListener('click', () => {
			try {
				let queryStr=codeEditor.value;
		        let textblob = new Blob([queryStr], {
		            type: 'text/plain'
		        });
		        let dwnlnk = document.createElement('a');
		        dwnlnk.download = 'query.sql';
		        if (window.webkitURL != null) { dwnlnk.href = window.webkitURL.createObjectURL(textblob); }
		        dwnlnk.click();
		    } catch(err) {
		    	errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
		    }
		});

		function readFileAsArrayBuffer(file) {
	     	return new Promise((resolve,reject) => {
	            let fileredr = new FileReader();
	            fileredr.onload = () => resolve(fileredr.result);
	            fileredr.onerror = () => reject(fileredr);
	            fileredr.readAsArrayBuffer(file);
	        });
			}
			// const binaryArray = db.export();
			const fileNameDisplay=document.querySelector('#fileNameDisplay');
			const fileSizeDisplay=document.querySelector('#fileSizeDisplay');
			upload.addEventListener('change', async(ev) => {
				errorDisplay.innerHTML='';

	        let file = ev.currentTarget.files[0];
	        if(!file) return;

	        try {
	            fileNameDisplay.innerText=file.name;
	            fileSizeDisplay.innerText=`${parseInt(file.size/1024)} ㎅`;

	            let arrayBuffer=await readFileAsArrayBuffer(file);
				let uInt8Array=new Uint8Array(arrayBuffer);
				db=new SQL.Database(uInt8Array);
				sqlQuery='SELECT name AS table_name FROM sqlite_master WHERE type =\'table\' AND name NOT LIKE \'sqlite_%\'';
				resultset = getResultSetAsRowJSON(db, sqlQuery);

	            let noOfTables=resultset.length;
	            noOfTablesDisplay.innerHTML=noOfTables;

	        	for(let rowObj of resultset) {
	        		let tblName=rowObj['table_name']; // {table_name: 'icd9_mapping'}

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

	        		loadTableSelectable(tblName);
	        	}
	        } catch(err) {
	        	errorDisplay.innerHTML='';
				errorDisplay.innerHTML=`<span class='emoji'>⚠</span> ERROR: ${err.message}`;
				console.log(err);
	        }

	        const convertBitArrtoB64 = (bitArr) => ( btoa( bitArr.reduce((data, byte) => data + String.fromCharCode(byte), '') ) );

	        const exportDB=document.querySelector('#exportDB');
	        exportDB.addEventListener('click', (evt)=> {
	        	const arrayBuffer = db.export();
	        	let uInt8Array=new Uint8Array(arrayBuffer);
	        	let b64Str=convertBitArrtoB64(uInt8Array);

	        	let dwnlnk = document.createElement('a');
		        dwnlnk.download = 'sqliteDatabaseOutput.db';
		        dwnlnk.href=`data:application/db;base64,${b64Str}`;
		        dwnlnk.click();
	        });
	   }); // upload file change event
	}); // DOMContentLoaded
}