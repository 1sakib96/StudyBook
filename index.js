let currentSubjectId = null;
let subjects = [];
let student = null;

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    showNewUser();

});


function getElement(id) {

    return document.getElementById(id);

}


function loadData() {

    try {

        const savedStudent =
            localStorage.getItem(
                "studybook_student"
            );

        const savedSubjects =
            localStorage.getItem(
                "studybook_subjects"
            );


        /*
            No personal information is loaded.

            StudyBook no longer uses:
            - Full name
            - Nickname
            - Department
            - Semester
            - Password
        */

        student = null;


        subjects =
            savedSubjects
                ? JSON.parse(savedSubjects)
                : [];

        renderStudyDays();


        subjects.forEach(function (subject) {

            if (!Array.isArray(subject.resources)) {

                subject.resources = [];

            }


            if (!Array.isArray(subject.important)) {

                subject.important = [];

            }


            if (typeof subject.note !== "string") {

                subject.note = "";

            }

        });


    } catch (error) {

        console.error(
            "Could not load StudyBook data:",
            error
        );


        student = null;

        subjects = [];

    }

}


/* =========================================================
   WELCOME SCREEN
   ========================================================= */

function showNewUser() {

    getElement("welcomeScreen")
        .classList.remove("hidden");


    getElement("mainScreen")
        .classList.add("hidden");


    getElement("newUserArea")
        .classList.remove("hidden");


    /*
        Old welcome/login areas may no longer
        exist in the HTML.

        These checks keep the JavaScript safe
        if an older HTML version is used.
    */

    const welcomeBackArea =
        getElement("welcomeBackArea");

    if (welcomeBackArea) {

        welcomeBackArea
            .classList
            .add("hidden");

    }


    const forgotArea =
        getElement("forgotArea");

    if (forgotArea) {

        forgotArea
            .classList
            .add("hidden");

    }


    const welcomeMessage =
        getElement("welcomeMessage");

    if (welcomeMessage) {

        welcomeMessage.textContent = "";

    }

}


function showWelcomeBack() {

    showNewUser();

}


function showForgotPassword() {

    showNewUser();

}


/* =========================================================
   ENTER STUDYBOOK
   ========================================================= */

function createAccount() {

    /*
        The welcome page asks for
        absolutely no information.

        Just enter StudyBook.
    */

    showMainPage();

}


/*
    Compatibility functions for old HTML.
*/

function loginUser() {

    showMainPage();

}


function resetPassword() {

    showMainPage();

}


/* =========================================================
   RESET EVERYTHING
   ========================================================= */

async function resetEverything() {

    const confirmReset =
        confirm(
            "This will delete all StudyBook subjects and information. Continue?"
        );


    if (!confirmReset) {

        return;

    }


    await clearAllStoredPDFs();


    localStorage.clear();


    student = null;

    subjects = [];

    currentSubjectId = null;


    location.reload();

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showWelcomeMessage(message) {

    const element =
        getElement("welcomeMessage");


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   SHOW MAIN PAGE
   ========================================================= */

function showMainPage() {

    getElement("welcomeScreen")
        .classList.add("hidden");


    getElement("mainScreen")
        .classList.remove("hidden");


    updateStudentUI();


    renderSubjects();


    showDashboard();

}


/* =========================================================
   STUDENT UI
   ========================================================= */

function updateStudentUI() {

    /*
        Intentionally empty.

        StudyBook no longer displays or
        stores personal student information.
    */

}


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {

    /*
        Remove any old personal-information
        storage from previous versions.
    */

    localStorage.removeItem(
        "studybook_student"
    );


    /*
        Only StudyBook content is stored.
    */

    localStorage.setItem(
        "studybook_subjects",
        JSON.stringify(subjects)
    );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function showDashboard() {

    getElement("dashboardView")
        .classList.remove("hidden");


    getElement("subjectView")
        .classList.add("hidden");


    currentSubjectId = null;


    renderSubjects();
    renderStudyDays();


    closeSidebarOnMobile();

}


/* =========================================================
   ADD SUBJECT
   ========================================================= */

function openAddSubject() {

    showModal(`

        <h2>
            ➕ Add New Subject
        </h2>

        <input
            type="text"
            id="newSubjectName"
            placeholder="Subject name"
        >

        <input
            type="text"
            id="newSubjectCode"
            placeholder="Course code"
        >

        <button
            class="modal-action"
            onclick="createSubject()">

            Add Subject

        </button>

    `);

}


/* =========================================================
   CREATE SUBJECT
   ========================================================= */

function createSubject() {

    const name =
        getElement("newSubjectName")
            .value
            .trim();


    const code =
        getElement("newSubjectCode")
            .value
            .trim();


    if (!name) {

        alert(
            "Please enter a subject name."
        );

        return;

    }


    const subject = {

        id: Date.now(),

        name: name,

        code: code,

        note: "",

        resources: [],

        important: []

    };


    subjects.push(subject);


    saveData();


    closeModal();


    renderSubjects();

}


/* =========================================================
   RENDER SUBJECTS
   ========================================================= */

function renderSubjects() {

    const shelf =
        getElement("subjectShelf");


    const count =
        getElement("subjectCount");


    if (!shelf) return;


    const searchInput =
        getElement("subjectSearch");


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        subjects.filter(
            function (subject) {

                return (

                    subject.name
                        .toLowerCase()
                        .includes(
                            searchText
                        )

                    ||

                    (
                        subject.code ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchText
                        )

                );

            }
        );


    if (count) {

        count.textContent =
            subjects.length +
            (
                subjects.length === 1
                    ? " Subject"
                    : " Subjects"
            );

    }


    if (filtered.length === 0) {

        shelf.innerHTML = `

            <div class="empty-shelf">

                <div class="empty-shelf-icon">
                    📚
                </div>

                <h3>
                    No subjects yet
                </h3>

                <p>
                    Add your first subject and start building your StudyBook.
                </p>

                <br>

                <button
                    class="add-subject-btn"
                    onclick="openAddSubject()">

                    + Add Subject

                </button>

            </div>

        `;

        return;

    }


    shelf.innerHTML = "";


    filtered.forEach(
        function (subject) {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "book-wrapper";


            wrapper.innerHTML = `

                <div
                    class="book"
                    onclick="openSubject(${subject.id})">

                    <button
                        class="book-delete"
                        onclick="
                            event.stopPropagation();
                            deleteSubject(${subject.id})
                        ">

                        ×

                    </button>


                    <div class="book-title">

                        ${escapeHTML(
                            subject.name
                        )}

                    </div>


                    <div class="book-code">

                        ${escapeHTML(
                            subject.code ||
                            "No course code"
                        )}

                    </div>


                    <div class="book-open">

                        OPEN BOOK →

                    </div>


                    <div class="book-decoration">

                        📖

                    </div>

                </div>

            `;


            shelf.appendChild(wrapper);

        }
    );

}


/* =========================================================
   SEARCH SUBJECTS
   ========================================================= */

function searchSubjects() {

    renderSubjects();

}


/* =========================================================
   OPEN SUBJECT
   ========================================================= */

function openSubject(id) {

    const subject =
        subjects.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!subject) return;


    currentSubjectId = id;


    getElement("dashboardView")
        .classList.add("hidden");


    getElement("subjectView")
        .classList.remove("hidden");


    getElement("openedSubjectName")
        .textContent =
        subject.name;


    getElement("openedSubjectCode")
        .textContent =
        subject.code ||
        "No course code";


    getElement("subjectNote")
        .value =
        subject.note || "";


    renderResources(subject);


    renderImportant(subject);


    closeSidebarOnMobile();

}


/* =========================================================
   CURRENT SUBJECT
   ========================================================= */

function getCurrentSubject() {

    return subjects.find(
        function (subject) {

            return (
                subject.id ===
                currentSubjectId
            );

        }
    );

}


/* =========================================================
   INDEXEDDB
   ========================================================= */


/* =========================================================
   PERMANENT LOCAL PDF STORAGE
   Uses IndexedDB with chunked ArrayBuffers.
   This avoids Blob/File/base64 compatibility problems.
   ========================================================= */

const PDF_DB_NAME = "StudyBookPermanentPDF";
const PDF_DB_VERSION = 10;
const PDF_META_STORE = "pdfMeta";
const PDF_CHUNK_STORE = "pdfChunks";
const PDF_CHUNK_SIZE = 1024 * 1024; // 1 MB

function openPDFDatabase() {
    return new Promise(function(resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error("This browser does not support permanent PDF storage."));
            return;
        }

        let request;
        try {
            request = indexedDB.open(PDF_DB_NAME, PDF_DB_VERSION);
        } catch (e) {
            reject(e);
            return;
        }

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            // This database has a unique name/version so it cannot collide with
            // any of the older StudyBook PDF databases.
            if (!db.objectStoreNames.contains(PDF_META_STORE)) {
                db.createObjectStore(PDF_META_STORE, { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains(PDF_CHUNK_STORE)) {
                db.createObjectStore(PDF_CHUNK_STORE, {
                    keyPath: ["id", "index"]
                });
            }
        };

        request.onsuccess = function() {
            const db = request.result;
            db.onversionchange = function() {
                try { db.close(); } catch (e) {}
            };
            resolve(db);
        };

        request.onerror = function() {
            reject(request.error || new Error("Could not open PDF storage."));
        };

        request.onblocked = function() {
            reject(new Error("PDF storage is busy. Close another StudyBook tab and try again."));
        };
    });
}

async function fileToPDFBytes(file) {
    if (!file) throw new Error("No PDF selected.");

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!bytes.byteLength) {
        throw new Error("The selected PDF is empty.");
    }

    // Every real PDF starts with %PDF.
    const header = new TextDecoder().decode(bytes.subarray(0, 5));
    if (header !== "%PDF-") {
        throw new Error("The selected file is not a valid PDF.");
    }

    return bytes;
}

async function storePDFFile(id, file) {
    const bytes = await fileToPDFBytes(file);
    const db = await openPDFDatabase();

    try {
        // Remove any previous copy with the same ID.
        await new Promise(function(resolve, reject) {
            const tx = db.transaction(
                [PDF_META_STORE, PDF_CHUNK_STORE],
                "readwrite"
            );

            tx.objectStore(PDF_META_STORE).delete(String(id));

            const chunks = tx.objectStore(PDF_CHUNK_STORE);
            const range = IDBKeyRange.bound(
                [String(id), 0],
                [String(id), Number.MAX_SAFE_INTEGER]
            );
            const cursorRequest = chunks.openCursor(range);

            cursorRequest.onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            tx.oncomplete = resolve;
            tx.onerror = function() {
                reject(tx.error || new Error("Could not prepare PDF storage."));
            };
            tx.onabort = function() {
                reject(tx.error || new Error("Could not prepare PDF storage."));
            };
        });

        // Store metadata and binary chunks in one transaction.
        await new Promise(function(resolve, reject) {
            const tx = db.transaction(
                [PDF_META_STORE, PDF_CHUNK_STORE],
                "readwrite"
            );

            tx.objectStore(PDF_META_STORE).put({
                id: String(id),
                name: file.name || "StudyBook.pdf",
                size: bytes.byteLength,
                chunks: Math.ceil(bytes.byteLength / PDF_CHUNK_SIZE),
                savedAt: Date.now()
            });

            const store = tx.objectStore(PDF_CHUNK_STORE);

            let index = 0;
            for (let offset = 0; offset < bytes.byteLength; offset += PDF_CHUNK_SIZE) {
                const part = bytes.slice(
                    offset,
                    Math.min(offset + PDF_CHUNK_SIZE, bytes.byteLength)
                );

                store.put({
                    id: String(id),
                    index: index++,
                    data: part.buffer
                });
            }

            tx.oncomplete = resolve;
            tx.onerror = function() {
                reject(tx.error || new Error("Could not save PDF."));
            };
            tx.onabort = function() {
                reject(tx.error || new Error("Could not save PDF."));
            };
        });

        // Verify the stored metadata and every chunk.
        const check = await getStoredPDFBytes(String(id));

        if (!check || check.byteLength !== bytes.byteLength) {
            throw new Error("PDF storage verification failed.");
        }

        const checkHeader =
            new TextDecoder().decode(check.subarray(0, 5));

        if (checkHeader !== "%PDF-") {
            throw new Error("Saved PDF verification failed.");
        }

    } finally {
        try { db.close(); } catch (e) {}
    }
}

async function getStoredPDFBytes(id) {
    const db = await openPDFDatabase();

    try {
        const meta = await new Promise(function(resolve, reject) {
            const tx = db.transaction(PDF_META_STORE, "readonly");
            const req = tx.objectStore(PDF_META_STORE).get(String(id));

            req.onsuccess = function() {
                resolve(req.result || null);
            };

            req.onerror = function() {
                reject(req.error || new Error("Could not read PDF metadata."));
            };
        });

        if (!meta) return null;

        const records = await new Promise(function(resolve, reject) {
            const tx = db.transaction(PDF_CHUNK_STORE, "readonly");
            const store = tx.objectStore(PDF_CHUNK_STORE);
            const range = IDBKeyRange.bound(
                [String(id), 0],
                [String(id), Number.MAX_SAFE_INTEGER]
            );

            const result = [];
            const request = store.openCursor(range);

            request.onsuccess = function(event) {
                const cursor = event.target.result;

                if (!cursor) {
                    resolve(result);
                    return;
                }

                result.push(cursor.value);
                cursor.continue();
            };

            request.onerror = function() {
                reject(request.error || new Error("Could not read PDF data."));
            };
        });

        records.sort(function(a, b) {
            return a.index - b.index;
        });

        if (records.length !== meta.chunks) {
            throw new Error("Saved PDF data is incomplete.");
        }

        const bytes = new Uint8Array(meta.size);
        let offset = 0;

        for (const record of records) {
            let part;

            if (record.data instanceof ArrayBuffer) {
                part = new Uint8Array(record.data);
            } else if (ArrayBuffer.isView(record.data)) {
                part = new Uint8Array(
                    record.data.buffer,
                    record.data.byteOffset,
                    record.data.byteLength
                );
            } else {
                throw new Error("Saved PDF chunk is invalid.");
            }

            if (offset + part.byteLength > bytes.byteLength) {
                throw new Error("Saved PDF data is corrupted.");
            }

            bytes.set(part, offset);
            offset += part.byteLength;
        }

        if (offset !== meta.size) {
            throw new Error("Saved PDF size verification failed.");
        }

        return bytes;

    } finally {
        try { db.close(); } catch (e) {}
    }
}

async function getStoredPDF(id) {
    const bytes = await getStoredPDFBytes(String(id));

    if (!bytes || !bytes.byteLength) {
        return null;
    }

    const blob = new Blob([bytes], { type: "application/pdf" });

    const db = await openPDFDatabase();
    let name = "StudyBook.pdf";
    let savedAt = Date.now();

    try {
        const meta = await new Promise(function(resolve, reject) {
            const tx = db.transaction(PDF_META_STORE, "readonly");
            const req = tx.objectStore(PDF_META_STORE).get(String(id));

            req.onsuccess = function() {
                resolve(req.result || null);
            };

            req.onerror = function() {
                reject(req.error);
            };
        });

        if (meta) {
            name = meta.name || name;
            savedAt = meta.savedAt || savedAt;
        }
    } finally {
        try { db.close(); } catch (e) {}
    }

    const file = new File([blob], name, {
        type: "application/pdf",
        lastModified: savedAt
    });

    return {
        id: String(id),
        name: file.name,
        type: "application/pdf",
        size: file.size,
        savedAt: savedAt,
        file: file
    };
}

/* =========================================================
   DELETE STORED PDF
   ========================================================= */

async function deleteStoredPDF(id) {
    if (!id) return;

    const db = await openPDFDatabase();

    return new Promise(function(resolve, reject) {
        const tx = db.transaction(
            [PDF_META_STORE, PDF_CHUNK_STORE],
            "readwrite"
        );

        tx.objectStore(PDF_META_STORE).delete(String(id));

        const chunks = tx.objectStore(PDF_CHUNK_STORE);
        const range = IDBKeyRange.bound(
            [String(id), 0],
            [String(id), Number.MAX_SAFE_INTEGER]
        );

        const req = chunks.openCursor(range);
        req.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        tx.oncomplete = function() {
            try { db.close(); } catch (e) {}
            resolve();
        };

        tx.onerror = function() {
            try { db.close(); } catch (e) {}
            reject(tx.error || new Error("Could not delete PDF."));
        };
    });
}

async function clearAllStoredPDFs() {
    try {
        const db = await openPDFDatabase();

        return new Promise(function(resolve, reject) {
            const tx = db.transaction(
                [PDF_META_STORE, PDF_CHUNK_STORE],
                "readwrite"
            );

            tx.objectStore(PDF_META_STORE).clear();
            tx.objectStore(PDF_CHUNK_STORE).clear();

            tx.oncomplete = function() {
                try { db.close(); } catch (e) {}
                resolve();
            };

            tx.onerror = function() {
                try { db.close(); } catch (e) {}
                reject(tx.error);
            };
        });
    } catch (error) {
        console.error("Could not clear PDF storage:", error);
    }
}

/* =========================================================
   ADD PDF
   ========================================================= */

function addPDF() {

    const subject =
        getCurrentSubject();


    if (!subject) return;


    showModal(`

        <h2>
            📄 Add PDF
        </h2>

        <input
            type="text"
            id="pdfName"
            placeholder="PDF name"
        >

        <input
            type="url"
            id="pdfLink"
            placeholder="PDF URL (optional)"
        >

        <button
            class="modal-action"
            onclick="savePDF()">

            Save PDF

        </button>

        <br><br>

        <button
            class="modal-action"
            onclick="localFileSearch()">

            📁 Search Local PDF

        </button>

    `);

}


/* =========================================================
   SAVE PDF
   ========================================================= */

function savePDF() {

    const name =
        getElement("pdfName")
            .value
            .trim();


    const link =
        getElement("pdfLink")
            .value
            .trim();


    if (!name) {

        alert(
            "Enter a PDF name."
        );

        return;

    }


    const subject =
        getCurrentSubject();


    if (!subject) return;


    subject.resources.push({

        id: Date.now(),

        type: "PDF",

        name: name,

        link: link

    });


    saveData();


    closeModal();


    renderResources(subject);

}


/* =========================================================
   LOCAL PDF
   ========================================================= */

function localFileSearch() {
    showModal(`
        <h2>📁 Choose Local PDF</h2>
        <p style="color:#777;font-size:13px;line-height:1.6;margin-bottom:15px;">Choose a PDF from your phone or computer.</p>
        <input type="file" id="localPDF" accept=".pdf,application/pdf" onchange="localPDFSelected()">
        <div id="localPDFActions" style="margin-top:15px;">
            <p style="color:#888;font-size:13px;text-align:center;">Select a PDF to see the available actions.</p>
        </div>
    `);
    setTimeout(function () { const input = getElement("localPDF"); if (input) input.click(); }, 100);
}

function localPDFSelected() {
    const input = getElement("localPDF");
    const actions = getElement("localPDFActions");

    if (!input || !actions || !input.files || !input.files.length) return;

    const file = input.files[0];

    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {
        alert("Please select a PDF file.");
        input.value = "";
        return;
    }

    window.studyBookSelectedLocalPDF = file;

    actions.innerHTML = `
        <p style="font-size:13px;line-height:1.5;margin-bottom:12px;">
            <strong>Selected:</strong><br>${escapeHTML(file.name)}
        </p>

        <button class="modal-action" onclick="saveSelectedPDF()">
            💾 Save PDF
        </button>
        <br><br>

        <button class="modal-action" onclick="openSelectedPDF()">
            📖 Read PDF
        </button>
        <br><br>

        <button class="modal-action" onclick="openPDFWithOtherApp()">
            📤 Open with PDF App / Drive
        </button>
        <br><br>

        <button class="back-btn" style="width:100%;" onclick="backFromPDFSearch()">
            ← Back
        </button>
    `;
}


/* =========================================================
   SAVE SELECTED LOCAL PDF
   ========================================================= */

async function saveSelectedPDF() {
    const file = window.studyBookSelectedLocalPDF;
    if (!file) { alert("Please select a PDF first."); return; }
    const subject = getCurrentSubject();
    if (!subject) return;

    try {
        const pdfId = "pdf-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
        await storePDFFile(pdfId, file);
        subject.resources.push({
            id: Date.now(),
            type: "PDF",
            name: file.name || "StudyBook PDF",
            link: "",
            localPDF: true,
            pdfId: pdfId
        });
        saveData();
        renderResources(subject);
        alert("PDF saved and verified successfully.");
    } catch (error) {
        console.error("Could not save PDF:", error);
        alert("Could not save this PDF: " + (error.message || "Please try again."));
    }
}

/* =========================================================
   OPEN PDF WITH MOBILE APP / SHARE SHEET
   ========================================================= */

async function sharePDFFile(file) {
    if (!file) return false;

    // Native file sharing is the only web-standard way to hand a
    // local PDF to installed apps. The OS decides which compatible
    // apps (Drive, Files, Acrobat, etc.) are displayed.
    if (navigator.share && navigator.canShare) {
        try {
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: file.name || "StudyBook PDF",
                    files: [file]
                });
                return true;
            }
        } catch (e) {
            if (e && e.name === "AbortError") return true;
        }
    }
    return false;
}

async function openPDFWithOtherApp() {
    const file = window.studyBookSelectedLocalPDF;
    if (!file) {
        alert("Please select a PDF first.");
        return;
    }

    const shared = await sharePDFFile(file);
    if (shared) return;

    // If native sharing is unavailable, downloading is the only
    // reliable browser-level fallback for opening in another app.
    downloadFileObject(file);
}

function downloadFileObject(file) {
    if (!file) {
        alert("PDF is not available.");
        return;
    }

    try {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name || "StudyBook.pdf";
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
            try { URL.revokeObjectURL(url); } catch (e) {}
        }, 10000);
    } catch (e) {
        console.error(e);
        alert("Could not download the PDF.");
    }
}

function showPDFActionsForFile(file, fileURL) {
    showModal(`
        <div class="pdf-fullscreen-panel">
            <div class="pdf-toolbar">
                <strong class="pdf-title">📄 ${escapeHTML(file.name)}</strong>
                <button class="back-btn" onclick="backFromPDFSearch()">← Back</button>
            </div>
            <div class="pdf-mobile-actions">
                <button class="modal-action pdf-main-action" onclick="openSelectedPDF()">
                    📖 Open PDF Reader
                </button>
                <button class="modal-action pdf-main-action" onclick="openPDFWithOtherApp()">
                    📤 Open with PDF App / Drive
                </button>
                <button class="modal-action pdf-main-action" onclick="downloadCurrentPDF()">
                    💾 Download PDF
                </button>
                <button class="back-btn pdf-main-action" onclick="backFromPDFSearch()">
                    ← Back
                </button>
            </div>
            <p class="pdf-app-note">
                On mobile, the PDF app option uses the phone's native app chooser.
                The phone decides which compatible apps are available.
            </p>
        </div>
    `);
    getElement("modal").classList.add("pdf-viewer-modal");
}

function rememberPDFURL(url) {
    // Keep this helper safe across browsers. Object URLs are session-only and
    // cannot be reused after a full reload, so we only remember that a PDF
    // viewer was opened; we never persist the blob URL itself as a PDF file.
    try {
        if (url) sessionStorage.setItem("studybook_pdf_viewing", "1");
    } catch (e) {}
}

function openNativePDFFile(file) {
    if (!file) { alert("PDF is not available."); return false; }
    try {
        const url=URL.createObjectURL(file);
        window.studyBookCurrentPDFFile=file;
        window.studyBookCurrentPDFURL=url;
        rememberPDFURL(url);
        // Same-tab navigation is intentional: it is a real PDF navigation and
        // cannot be silently blocked as a popup. Browser Back returns to StudyBook.
        window.location.href=url;
        return true;
    } catch(error) {
        console.error("Could not open PDF:",error);
        return false;
    }
}

function showMobilePDFChoice(file) {
    if (!file) return;
    window.studyBookCurrentPDFFile = file;
    if (window.studyBookCurrentPDFURL) {
        try { URL.revokeObjectURL(window.studyBookCurrentPDFURL); } catch (e) {}
    }
    window.studyBookCurrentPDFURL = URL.createObjectURL(file);
    rememberPDFURL(window.studyBookCurrentPDFURL);

    showModal(`
        <div class="pdf-fullscreen-panel mobile-reader-panel">
            <div class="pdf-toolbar mobile-pdf-topbar">
                <button class="back-btn" onclick="closePDFViewer()">← Back</button>
                <strong class="pdf-title">📄 ${escapeHTML(file.name || "StudyBook PDF")}</strong>
            </div>
            <div class="mobile-pdf-choice">
                <p class="pdf-choice-text">Your PDF is ready. Open it with the phone's normal PDF viewer for the clearest reading experience.</p>
                <button class="modal-action pdf-main-action" onclick="openCurrentPDFInBrowser()">📖 Read PDF</button>
                <button class="modal-action pdf-main-action" onclick="openCurrentPDFWithApp()">📤 Open with PDF App / Drive</button>
                <button class="modal-action pdf-main-action" onclick="downloadCurrentPDF()">💾 Download PDF</button>
                <button class="back-btn pdf-main-action" onclick="closePDFViewer()">← Back</button>
            </div>
            <p class="pdf-app-note">If you opened StudyBook inside Messenger, use Messenger's browser menu → <strong>Open in browser</strong> if the PDF does not open here.</p>
        </div>
    `);
    const modal = getElement("modal");
    if (modal) modal.classList.add("pdf-viewer-modal");
}

async function openMobilePDFReader(file) {
    if (!file) return;
    window.studyBookCurrentPDFFile = file;
    if (window.studyBookCurrentPDFURL) {
        try { URL.revokeObjectURL(window.studyBookCurrentPDFURL); } catch (e) {}
    }
    window.studyBookCurrentPDFURL = URL.createObjectURL(file);
    rememberPDFURL(window.studyBookCurrentPDFURL);

    showModal(`
        <div class="pdf-fullscreen-panel mobile-reader-panel">
            <div class="pdf-toolbar mobile-pdf-topbar">
                <button class="back-btn" onclick="closePDFViewer()">← Back</button>
                <strong class="pdf-title">📄 ${escapeHTML(file.name || "StudyBook PDF")}</strong>
            </div>
            <div class="mobile-pdf-tools">
                <button class="modal-action" onclick="openCurrentPDFInBrowser()">🌐 Open in Browser</button>
                <button class="modal-action" onclick="openCurrentPDFWithApp()">📤 Open with App / Drive</button>
                <button class="modal-action" onclick="downloadCurrentPDF()">💾 Download PDF</button>
            </div>
            <div id="mobilePdfReader" class="mobile-pdf-reader pdf-single-page-reader">
                <div class="pdf-loading">Opening PDF…</div>
            </div>
            <div class="mobile-pdf-navigation">
                <button id="pdfPrevBtn" class="modal-action" onclick="previousPDFPage()">‹ Previous</button>
                <span id="pdfPageIndicator" class="pdf-page-indicator">Loading…</span>
                <button id="pdfNextBtn" class="modal-action" onclick="nextPDFPage()">Next ›</button>
            </div>
        </div>
    `);
    const modal = getElement("modal");
    if (modal) modal.classList.add("pdf-viewer-modal");
    await new Promise(function(resolve) { requestAnimationFrame(resolve); });
    await renderMobileSinglePagePDF(file);
}

async function openSelectedPDF() {
    const file = window.studyBookSelectedLocalPDF;
    if (!file) {
        alert("Please choose a PDF first.");
        return;
    }

    const url = URL.createObjectURL(file);
    window.studyBookCurrentPDFFile = file;
    window.studyBookCurrentPDFURL = url;
    rememberPDFURL(url);
    openPDFViewerReliably(url, file);
}

async function openSavedPDF(pdfId) {
    try {
        const savedPDF = await getStoredPDF(String(pdfId));

        if (!savedPDF || !savedPDF.file) {
            alert("This saved PDF could not be found. Please add the PDF again.");
            return;
        }

        const file = savedPDF.file instanceof File
            ? savedPDF.file
            : new File([savedPDF.file], savedPDF.name || "StudyBook.pdf",
                { type: "application/pdf", lastModified: Date.now() });

        if (file.size === 0) {
            throw new Error("Saved PDF is empty");
        }
        const normalizedBytes = await file.arrayBuffer();
        const normalizedBlob = new Blob([normalizedBytes], {type:"application/pdf"});
        const actualFile = new File([normalizedBlob], file.name || "StudyBook.pdf", {type:"application/pdf", lastModified:Date.now()});
        window.studyBookCurrentPDFFile = actualFile;

        const url = URL.createObjectURL(actualFile);
        window.studyBookCurrentPDFFile = actualFile;
        window.studyBookCurrentPDFURL = url;
        rememberPDFURL(url);
        openPDFViewerReliably(url, actualFile);
    } catch (error) {
        console.error("Could not open saved PDF:", error);
        alert("Could not open the saved PDF. " + (error && error.message ? error.message : "Please save the PDF again."));
    }
}

function appendPDFViewOptions(url) {
    // Ask native desktop PDF viewers to fit the document to the available width.
    // This does not control the viewer UI itself, but avoids the tiny default page view.
    if (!url) return url;
    return url + (url.includes("#") ? "&" : "#") + "zoom=page-width&view=FitH";
}

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
}

async function openPDFViewerReliably(url, file) {
    if (!file) {
        alert("PDF is not available.");
        return;
    }

    window.studyBookCurrentPDFFile = file;
    window.studyBookCurrentPDFURL = url;

    /*
      IMPORTANT:
      Do not use PDF.js for the actual reading path.
      The browser's native PDF viewer is much more reliable for both
      locally selected PDFs and PDFs restored from IndexedDB.
    */

    const mobile = isMobileDevice();

    if (mobile) {
        // A real top-level navigation is intentionally used here.
        // It works with local File/Blob URLs without depending on
        // popups, iframes, PDF.js workers, or Messenger's viewer.
        try {
            window.location.assign(url);
            return;
        } catch (error) {
            console.error("Native mobile PDF navigation failed:", error);

            // Keep a visible fallback if the browser refuses navigation.
            showModal(`
                <div class="pdf-fullscreen-panel mobile-reader-panel">
                    <div class="pdf-toolbar mobile-pdf-topbar">
                        <button class="back-btn" onclick="closePDFViewer()">← Back</button>
                        <strong class="pdf-title">📄 ${escapeHTML(file.name || "StudyBook PDF")}</strong>
                    </div>
                    <div class="mobile-pdf-choice">
                        <p class="pdf-choice-text">
                            The browser could not open the PDF directly.
                        </p>
                        <button class="modal-action pdf-main-action"
                            onclick="openCurrentPDFInBrowser()">
                            🌐 Open in Browser
                        </button>
                        <button class="modal-action pdf-main-action"
                            onclick="openCurrentPDFWithApp()">
                            📤 Open with PDF App / Drive
                        </button>
                        <button class="modal-action pdf-main-action"
                            onclick="downloadCurrentPDF()">
                            💾 Download PDF
                        </button>
                    </div>
                </div>
            `);

            const modal = getElement("modal");
            if (modal) modal.classList.add("pdf-viewer-modal");
            return;
        }
    }

    // Desktop: keep the working full-screen native browser PDF viewer.
    const nativeURL = appendPDFViewOptions(url);

    showModal(`
        <div class="pdf-fullscreen-panel native-pdf-panel">
            <div class="pdf-toolbar">
                <strong class="pdf-title">
                    📄 ${escapeHTML(file.name || "StudyBook PDF")}
                </strong>
                <div class="pdf-toolbar-actions">
                    <button class="modal-action"
                        onclick="openCurrentPDFInBrowser()">
                        ↗ Open
                    </button>
                    <button class="modal-action"
                        onclick="downloadCurrentPDF()">
                        💾 Download
                    </button>
                    <button class="back-btn"
                        onclick="closePDFViewer()">
                        ← Back
                    </button>
                </div>
            </div>

            <iframe
                class="desktop-pdf-frame"
                src="${escapeAttribute(nativeURL)}"
                title="${escapeAttribute(file.name || "StudyBook PDF")}"
                allow="fullscreen"
            ></iframe>
        </div>
    `);

    const modal = getElement("modal");
    if (modal) {
        modal.classList.add("pdf-viewer-modal");
        modal.scrollTop = 0;
    }
}

async function renderMobileSinglePagePDF(file) {
    const container = getElement("mobilePdfReader");
    if (!container) return;

    try {
        if (!window.pdfjsLib) throw new Error("PDF.js library unavailable");

        // Mobile stability: do not depend on a separate worker download.
        // Rendering one page at a time with the main thread is slower, but
        // far more reliable for PDFs selected from local phone storage.
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "";

        const buffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            disableWorker: true,
            disableAutoFetch: true,
            disableStream: true,
            isEvalSupported: false
        }).promise;

        window.studyBookPDFDocument = pdf;
        window.studyBookPDFPageNumber = 1;
        window.studyBookPDFRendering = false;

        await new Promise(resolve => requestAnimationFrame(resolve));
        await renderMobilePDFPage();
    } catch (error) {
        console.error("Mobile PDF render error:", error);
        container.innerHTML = `
            <div class="pdf-error">
                <strong>Could not display this PDF here.</strong>
                <p>Please use the browser reader or download the PDF.</p>
                <button class="modal-action" onclick="openCurrentPDFInBrowser()">📖 Open in Browser</button>
                <button class="modal-action" onclick="downloadCurrentPDF()">💾 Download</button>
            </div>`;
    }
}

async function renderMobilePDFPage() {
    const pdf = window.studyBookPDFDocument;
    const container = getElement("mobilePdfReader");
    if (!pdf || !container || window.studyBookPDFRendering) return;

    window.studyBookPDFRendering = true;
    container.innerHTML = '<div class="pdf-loading">Loading page…</div>';

    try {
        const pageNumber = window.studyBookPDFPageNumber || 1;
        const page = await pdf.getPage(pageNumber);

        // Render at CSS size (DPR 1) to keep memory usage predictable.
        const availableWidth = Math.max(280, container.clientWidth - 20);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, availableWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.className = "mobile-pdf-canvas single-pdf-canvas";
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";
        canvas.style.margin = "0 auto";
        canvas.style.background = "#fff";

        const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
        if (!ctx) throw new Error("Canvas unavailable");

        container.replaceChildren(canvas);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const indicator = getElement("pdfPageIndicator");
        if (indicator) indicator.textContent = `${pageNumber} / ${pdf.numPages}`;

        const prev = getElement("pdfPrevBtn");
        const next = getElement("pdfNextBtn");
        if (prev) prev.disabled = pageNumber <= 1;
        if (next) next.disabled = pageNumber >= pdf.numPages;

        container.scrollTop = 0;
    } catch (error) {
        console.error("PDF page render error:", error);
        container.innerHTML = `
            <div class="pdf-error">
                <strong>Could not render page ${window.studyBookPDFPageNumber || 1}.</strong>
                <p>Try opening the PDF in your browser.</p>
                <button class="modal-action" onclick="openCurrentPDFInBrowser()">📖 Open in Browser</button>
                <button class="modal-action" onclick="downloadCurrentPDF()">💾 Download</button>
            </div>`;
    } finally {
        window.studyBookPDFRendering = false;
    }
}

async function previousPDFPage() {
    const pdf = window.studyBookPDFDocument;
    if (!pdf || window.studyBookPDFRendering) return;
    if ((window.studyBookPDFPageNumber || 1) <= 1) return;
    window.studyBookPDFPageNumber--;
    await renderMobilePDFPage();
}

async function nextPDFPage() {
    const pdf = window.studyBookPDFDocument;
    if (!pdf || window.studyBookPDFRendering) return;
    if ((window.studyBookPDFPageNumber || 1) >= pdf.numPages) return;
    window.studyBookPDFPageNumber++;
    await renderMobilePDFPage();
}

function openCurrentPDFInBrowser() {
    const file = window.studyBookCurrentPDFFile;
    if (!file) {
        alert("PDF is not available.");
        return;
    }

    if (openNativePDFFile(file)) {
        return;
    }

    // Last resort: download the real PDF file.
    downloadFileObject(file);
}

async function openCurrentPDFWithApp() {
    const file = window.studyBookCurrentPDFFile;
    if (!file) {
        alert("PDF is not available.");
        return;
    }

    // On supported phones this opens the operating system's compatible
    // app chooser. The OS, not the website, decides which PDF apps appear.
    const shared = await sharePDFFile(file);
    if (!shared) downloadFileObject(file);
}

function downloadCurrentPDF() {
    const file = window.studyBookCurrentPDFFile;
    if (file) downloadFileObject(file);
    else alert("PDF is not available.");
}

function showPDFViewer(fileURL, fileName, file) {
    const actualFile = file || window.studyBookCurrentPDFFile;
    if (!actualFile) {
        alert("PDF is not available.");
        return;
    }
    window.studyBookCurrentPDFURL = fileURL;
    window.studyBookCurrentPDFFile = actualFile;
    rememberPDFURL(fileURL);
    openPDFViewerReliably(fileURL, actualFile);
}

function closePDFViewer() {
    if (window.studyBookPDFObserver) {
        window.studyBookPDFObserver.disconnect();
        window.studyBookPDFObserver = null;
    }
    window.studyBookPDFDocument = null;
    window.studyBookPDFPageNumber = null;
    window.studyBookPDFRendering = false;
    const modal = getElement("modal");
    if (modal) modal.classList.remove("pdf-viewer-modal");
    window.studyBookSelectedLocalPDF = null;
    window.studyBookCurrentPDFFile = null;
    window.studyBookCurrentPDFURL = null;
    closeModal(false);
}


/* =========================================================
   ADD LINK
   ========================================================= */

function addLink() {

    showModal(`

        <h2>
            🔗 Save Link
        </h2>

        <input
            type="text"
            id="linkName"
            placeholder="Link name"
        >

        <input
            type="url"
            id="linkURL"
            placeholder="https://example.com"
        >

        <button
            class="modal-action"
            onclick="saveLink()">

            Save Link

        </button>

    `);

}


function saveLink() {

    const name =
        getElement("linkName")
            .value
            .trim();


    const link =
        getElement("linkURL")
            .value
            .trim();


    if (!name || !link) {

        alert(
            "Enter both link name and URL."
        );

        return;

    }


    const subject =
        getCurrentSubject();


    if (!subject) return;


    subject.resources.push({

        id: Date.now(),

        type: "LINK",

        name: name,

        link: link

    });


    saveData();


    closeModal();


    renderResources(
        subject
    );

}


/* =========================================================
   RENDER RESOURCES
   ========================================================= */

function renderResources(subject) {

    const list =
        getElement("resourceList");


    if (!list) return;


    if (
        !subject.resources ||
        subject.resources.length === 0
    ) {

        list.innerHTML = `

            <p style="
                font-size:12px;
                color:#888;
                text-align:center;
                padding:15px;
            ">

                No resources added yet.

            </p>

        `;

        return;

    }


    list.innerHTML = "";


    subject.resources.forEach(
        function (resource) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "resource-item";


            if (
                resource.type === "PDF" &&
                resource.localPDF &&
                resource.pdfId
            ) {

                item.innerHTML = `

                    <button
                        class="resource-delete"
                        onclick="
                            deleteResource(
                                ${resource.id}
                            )
                        ">

                        ×

                    </button>


                    <strong>

                        📄 PDF —

                        ${escapeHTML(
                            resource.name
                        )}

                    </strong>


                    <div style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                        margin-top:8px;
                    ">

                        <button
                            class="modal-action"
                            style="
                                width:auto;
                                padding:8px 12px;
                            "
                            onclick="
                                openSavedPDF(
                                    '${escapeAttribute(
                                        resource.pdfId
                                    )}'
                                )
                            ">

                            📖 Open PDF

                        </button>


                        <button
                            class="delete-pdf-button"
                            style="
                                border:1px solid #e45d6b;
                                background:#fff5f6;
                                color:#d8495a;
                                padding:8px 12px;
                                border-radius:9px;
                                cursor:pointer;
                                font-weight:bold;
                            "
                            onclick="
                                deletePDF(
                                    ${resource.id}
                                )
                            ">

                            🗑️ Delete PDF

                        </button>

                    </div>

                `;


                list.appendChild(item);


                return;

            }


            let linkHTML = "";


            if (resource.link) {

                linkHTML = `

                    <a
                        href="${escapeAttribute(
                            resource.link
                        )}"
                        target="_self">

                        Open resource

                    </a>

                `;

            } else {

                linkHTML = `

                    <span style="color:#999">

                        No online link

                    </span>

                `;

            }


            item.innerHTML = `

                <button
                    class="resource-delete"
                    onclick="
                        deleteResource(
                            ${resource.id}
                        )
                    ">

                    ×

                </button>


                <strong>

                    ${escapeHTML(
                        resource.type
                    )}

                    —

                    ${escapeHTML(
                        resource.name
                    )}

                </strong>


                ${linkHTML}

            `;


            list.appendChild(item);

        }
    );

}


/* =========================================================
   DELETE PDF
   ========================================================= */

async function deletePDF(id) {

    const subject =
        getCurrentSubject();


    if (!subject) return;


    const resource =
        subject.resources.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!resource) return;


    const confirmed =
        confirm(
            `Delete PDF "${resource.name}"?`
        );


    if (!confirmed) return;


    try {

        if (resource.pdfId) {

            await deleteStoredPDF(
                resource.pdfId
            );

        }


        subject.resources =
            subject.resources.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        saveData();


        renderResources(
            subject
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Could not delete the PDF."
        );

    }

}


/* =========================================================
   DELETE RESOURCE
   ========================================================= */

async function deleteResource(id) {

    const subject =
        getCurrentSubject();


    if (!subject) return;


    const resource =
        subject.resources.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!resource) return;


    if (
        resource.localPDF &&
        resource.pdfId
    ) {

        try {

            await deleteStoredPDF(
                resource.pdfId
            );

        } catch (error) {

            console.error(
                error
            );

        }

    }


    subject.resources =
        subject.resources.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveData();


    renderResources(
        subject
    );

}


/* =========================================================
   IMPORTANT ITEMS
   ========================================================= */

function addCT() {

    addImportantItem(
        "CT",
        "📅 Add CT date"
    );

}


function addAssignment() {

    addImportantItem(
        "Assignment",
        "📋 Add assignment deadline"
    );

}


function addMidExam() {

    addImportantItem(
        "Mid Exam",
        "📝 Add mid exam date"
    );

}


function addFinalExam() {

    addImportantItem(
        "Final Exam",
        "🎓 Add final exam date"
    );

}


function addClue() {

    addImportantItem(
        "Clue",
        "💡 Write an important clue"
    );

}


function addAdvice() {

    addImportantItem(
        "Advice",
        "💬 Write your advice"
    );

}


function addImportantItem(type, placeholder) {
    if (type === "CT") {
        showModal(`
            <h2>📅 CT Date</h2>
            <p style="color:#777;font-size:13px;line-height:1.5;">Select the CT date from the calendar.</p>
            <input type="date" id="importantDate" aria-label="CT date">
            <textarea id="importantText" placeholder="Optional note for this CT..."></textarea>
            <button class="modal-action" onclick="saveImportantItem('CT')">Save CT Date</button>
        `);
        return;
    }
    showModal(`
        <h2>${type}</h2>
        <textarea id="importantText" placeholder="${placeholder}"></textarea>
        <button class="modal-action" onclick="saveImportantItem('${type}')">Save</button>
    `);
}

function saveImportantItem(type) {
    const textElement = getElement("importantText");
    const dateElement = getElement("importantDate");
    const text = textElement ? textElement.value.trim() : "";
    const date = dateElement ? dateElement.value : "";
    if (type === "CT" && !date) { alert("Please select the CT date."); return; }
    if (type !== "CT" && !text) { alert("Please enter something."); return; }
    const subject = getCurrentSubject();
    if (!subject) return;
    subject.important.push({ id: Date.now(), type: type, text: text, date: date });
    saveData(); closeModal(); renderImportant(subject);
}


function renderImportant(subject) {

    const list =
        getElement("importantList");


    if (!list) return;


    if (
        !subject.important ||
        subject.important.length === 0
    ) {

        list.innerHTML = `

            <p style="
                font-size:12px;
                color:#888;
                text-align:center;
                padding:15px;
            ">

                No important information yet.

            </p>

        `;

        return;

    }


    list.innerHTML = "";


    subject.important.forEach(
        function (item) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "resource-item";


            div.innerHTML = `

                <button
                    class="resource-delete"
                    onclick="
                        deleteImportant(
                            ${item.id}
                        )
                    ">

                    ×

                </button>


                <strong>

                    ${escapeHTML(
                        item.type
                    )}

                </strong>


                <span>
                    ${item.date ? `📅 ${escapeHTML(formatStudyDate(item.date))}${item.text ? ` — ${escapeHTML(item.text)}` : ""}` : escapeHTML(item.text)}
                </span>

            `;


            list.appendChild(div);

        }
    );

}


function deleteImportant(id) {

    const subject =
        getCurrentSubject();


    if (!subject) return;


    subject.important =
        subject.important.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveData();


    renderImportant(
        subject
    );

}


/* =========================================================
   SUBJECT NOTES
   ========================================================= */

function saveSubjectNote() {

    const subject =
        getCurrentSubject();


    if (!subject) return;


    subject.note =
        getElement("subjectNote")
            .value;


    saveData();


    alert(
        "Subject note saved."
    );

}


/* =========================================================
   DELETE SUBJECT
   ========================================================= */

async function deleteSubject(id) {

    const subject =
        subjects.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!subject) return;


    const confirmed =
        confirm(
            `Delete "${subject.name}"?`
        );


    if (!confirmed) return;


    if (
        subject.resources &&
        subject.resources.length
    ) {

        for (
            const resource
            of subject.resources
        ) {

            if (
                resource.localPDF &&
                resource.pdfId
            ) {

                try {

                    await deleteStoredPDF(
                        resource.pdfId
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                }

            }

        }

    }


    subjects =
        subjects.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveData();


    renderSubjects();


    if (
        currentSubjectId === id
    ) {

        showDashboard();

    }

}


function deleteCurrentSubject() {

    if (!currentSubjectId) return;


    deleteSubject(
        currentSubjectId
    );

}


/* =========================================================
   NOTES
   ========================================================= */

function openNotes() {

    showModal(`

        <h2>
            📝 My Notes
        </h2>

        <textarea
            id="generalNotes"
            placeholder="Write your general study notes..."
            style="min-height:250px">
        </textarea>

        <button
            class="modal-action"
            onclick="saveGeneralNotes()">

            Save Notes

        </button>

    `);


    getElement("generalNotes")
        .value =
        localStorage.getItem(
            "studybook_general_notes"
        ) || "";

}


function saveGeneralNotes() {

    const notes =
        getElement("generalNotes")
            .value;


    localStorage.setItem(
        "studybook_general_notes",
        notes
    );


    closeModal();


    alert(
        "Notes saved."
    );

}


/* =========================================================
   GOOGLE DRIVE
   ========================================================= */

function driveSearch() {

    const query =
        prompt(
            "What file or PDF do you want to find in Google Drive?"
        );


    if (!query) return;


    window.location.href =
        "https://drive.google.com/drive/u/0/search?q=" +
        encodeURIComponent(
            query
        );

}


/* =========================================================
   WHATSAPP
   ========================================================= */

function whatsappSearch() {

    const query =
        prompt(
            "What do you want to search on WhatsApp?"
        );


    if (!query) return;


    window.location.href =
        "https://www.google.com/search?q=" +
        encodeURIComponent(
            "site:whatsapp.com " +
            query
        );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

    showModal(`

        <h2>
            ⚙️ Settings
        </h2>


        <button
            class="resource-option"
            onclick="resetEverything()">

            ♻️

            <span>

                <strong>
                    Reset Everything
                </strong>

                <small>
                    Delete all StudyBook information
                </small>

            </span>

        </button>


        <button
            class="resource-option"
            onclick="exitStudyBook()">

            🚪

            <span>

                <strong>
                    Exit
                </strong>

                <small>
                    Leave StudyBook
                </small>

            </span>

        </button>

    `);

}


/* =========================================================
   EXIT
   ========================================================= */

function exitStudyBook() {

    const confirmed =
        confirm(
            "Do you want to exit StudyBook?"
        );


    if (!confirmed) return;


    closeModal();


    getElement("mainScreen")
        .classList.add("hidden");


    getElement("welcomeScreen")
        .classList.remove("hidden");


    showNewUser();

}


/* =========================================================
   STUDY CALENDAR / NOTE OF THIS DAY
   ========================================================= */

function getStudyDays() {
    try { const saved = localStorage.getItem("studybook_study_days"); return saved ? JSON.parse(saved) : []; }
    catch (error) { console.error("Could not load study days:", error); return []; }
}

function saveStudyDay() {
    const dateInput = getElement("plannerDate"), noteInput = getElement("plannerNote");
    const date = dateInput ? dateInput.value : "", note = noteInput ? noteInput.value.trim() : "";
    if (!date) { alert("Please select a date."); return; }
    if (!note) { alert("Please write a note for this day."); return; }
    const days = getStudyDays(); days.push({ id: Date.now(), date: date, note: note });
    days.sort(function(a,b){ return a.date.localeCompare(b.date); });
    localStorage.setItem("studybook_study_days", JSON.stringify(days));
    dateInput.value = ""; noteInput.value = ""; renderStudyDays();
}

function deleteStudyDay(id) {
    const days = getStudyDays().filter(function(item){ return item.id !== id; });
    localStorage.setItem("studybook_study_days", JSON.stringify(days)); renderStudyDays();
}

function formatStudyDate(dateString) {
    if (!dateString) return ""; const p = dateString.split("-"); if (p.length !== 3) return dateString;
    const date = new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
    return date.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
}

function renderStudyDays() {
    const list = getElement("studyDayList"); if (!list) return; const days = getStudyDays();
    if (!days.length) { list.innerHTML = `<p style="font-size:12px;color:#888;text-align:center;padding:10px;">No important dates saved yet.</p>`; return; }
    list.innerHTML = days.map(function(item){ return `
        <div class="study-day-item"><div class="study-day-info"><strong>📅 ${escapeHTML(formatStudyDate(item.date))}</strong><span>📝 ${escapeHTML(item.note)}</span></div><button class="study-day-delete" onclick="deleteStudyDay(${item.id})" aria-label="Delete note">×</button></div>`; }).join("");
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    getElement("sidebar")
        .classList.toggle("open");

}


function closeSidebarOnMobile() {

    const sidebar =
        getElement("sidebar");


    if (
        window.innerWidth <= 760
    ) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(content) {

    getElement("modalContent")
        .innerHTML =
        content;


    getElement("modal")
        .classList.remove(
            "hidden"
        );

}


function closeModal(revokePDF = true) {

    if (revokePDF && window.studyBookCurrentPDFURL) {
        try {
            URL.revokeObjectURL(window.studyBookCurrentPDFURL);
        } catch (e) {}
        window.studyBookCurrentPDFURL = null;
    }

    getElement("modal")
        .classList.add("hidden");
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
