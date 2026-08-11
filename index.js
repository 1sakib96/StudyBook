let currentSubjectId = null;
let subjects = [];
let student = null;

const PDF_DB_NAME = "StudyBookPDFDatabase";
const PDF_DB_VERSION = 1;
const PDF_STORE_NAME = "pdfFiles";

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

function openPDFDatabase() {

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    PDF_DB_NAME,
                    PDF_DB_VERSION
                );


            request.onupgradeneeded =
                function (event) {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            PDF_STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            PDF_STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


            request.onsuccess =
                function () {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   STORE PDF
   ========================================================= */

async function storePDFFile(
    id,
    file
) {

    const db =
        await openPDFDatabase();


    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    PDF_STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE_NAME
                );


            store.put({

                id: id,

                name: file.name,

                type:
                    file.type ||
                    "application/pdf",

                file: file

            });


            transaction.oncomplete =
                function () {

                    db.close();

                    resolve();

                };


            transaction.onerror =
                function () {

                    db.close();

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================================================
   GET STORED PDF
   ========================================================= */

async function getStoredPDF(id) {

    const db =
        await openPDFDatabase();


    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    PDF_STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE_NAME
                );


            const request =
                store.get(id);


            request.onsuccess =
                function () {

                    db.close();

                    resolve(
                        request.result ||
                        null
                    );

                };


            request.onerror =
                function () {

                    db.close();

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   DELETE STORED PDF
   ========================================================= */

async function deleteStoredPDF(id) {

    if (!id) return;


    const db =
        await openPDFDatabase();


    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    PDF_STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE_NAME
                );


            store.delete(id);


            transaction.oncomplete =
                function () {

                    db.close();

                    resolve();

                };


            transaction.onerror =
                function () {

                    db.close();

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================================================
   CLEAR STORED PDF FILES
   ========================================================= */

async function clearAllStoredPDFs() {

    try {

        const db =
            await openPDFDatabase();


        return new Promise(
            function (resolve, reject) {

                const transaction =
                    db.transaction(
                        PDF_STORE_NAME,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        PDF_STORE_NAME
                    );


                store.clear();


                transaction.oncomplete =
                    function () {

                        db.close();

                        resolve();

                    };


                transaction.onerror =
                    function () {

                        db.close();

                        reject(
                            transaction.error
                        );

                    };

            }
        );


    } catch (error) {

        console.error(
            "Could not clear PDF storage:",
            error
        );

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
   OPEN PDF WITH MOBILE APP / SHARE SHEET
   ========================================================= */

async function sharePDFFile(file) {

    if (!file) {
        alert("Please select a PDF first.");
        return false;
    }

    /*
       A website cannot choose a specific installed app itself.
       navigator.share({files:[file]}) asks the operating system
       for its native share/open-with sheet. The phone decides
       which compatible apps appear (Drive, Files, Acrobat, Xodo,
       WPS, Samsung PDF viewer, etc.).
    */
    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
    ) {
        try {
            await navigator.share({
                title: file.name,
                text: "Open this PDF with an installed app",
                files: [file]
            });

            return true;
        } catch (error) {
            if (error && error.name === "AbortError") {
                return true;
            }
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

    /* Fallback: download/open the file using the browser. */
    const url = URL.createObjectURL(file);
    window.studyBookCurrentPDFURL = url;

    showPDFActionsForFile(file, url, true);
}


/* =========================================================
   PDF ACTIONS FOR A FILE
   ========================================================= */

function showPDFActionsForFile(file, fileURL, isLocalSelection) {

    const mobile = isMobileDevice();

    showModal(`
        <div style="text-align:center;">
            <h2 style="word-break:break-word;">
                📄 ${escapeHTML(file.name)}
            </h2>

            <p style="color:#777;font-size:13px;line-height:1.6;">
                Choose how you want to read this PDF.
            </p>

            <a
                href="${escapeAttribute(fileURL)}"
                target="_blank"
                rel="noopener"
                class="modal-action"
                style="display:block;text-align:center;text-decoration:none;box-sizing:border-box;">
                📖 Open in Browser
            </a>

            ${mobile ? `
                <br>
                <button
                    class="modal-action"
                    onclick="openPDFWithOtherApp()">
                    📤 Open with PDF App / Drive
                </button>
            ` : ""}

            <br><br>
            <button
                class="back-btn"
                style="width:100%;"
                onclick="backFromPDFSearch()">
                ← Back to StudyBook
            </button>
        </div>
    `);
}


function backFromPDFSearch() {

    window.studyBookSelectedLocalPDF = null;

    closeModal();
}


/* =========================================================
   SAVE SELECTED PDF
   ========================================================= */

async function saveSelectedPDF() {

    const input =
        getElement("localPDF");


    if (
        !input ||
        !input.files ||
        input.files.length === 0
    ) {

        alert(
            "Please choose a PDF first."
        );

        return;

    }


    const file =
        input.files[0];


    if (
        file.type !== "application/pdf" &&
        !file.name
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        alert(
            "Please select a PDF file."
        );

        return;

    }


    const subject =
        getCurrentSubject();


    if (!subject) {

        alert(
            "Please open a subject first."
        );

        return;

    }


    const pdfId =
        "pdf_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10);


    try {

        await storePDFFile(
            pdfId,
            file
        );


        subject.resources.push({

            id: Date.now(),

            type: "PDF",

            name: file.name,

            link: "",

            localPDF: true,

            pdfId: pdfId

        });


        saveData();


        closeModal();


        renderResources(
            subject
        );


        alert(
            "PDF saved successfully."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Could not save the PDF."
        );

    }

}


/* =========================================================
   OPEN SELECTED PDF
   ========================================================= */

function openSelectedPDF() {

    const file = window.studyBookSelectedLocalPDF;

    if (!file) {
        alert("Please choose a PDF first.");
        return;
    }

    const fileURL = URL.createObjectURL(file);
    window.studyBookCurrentPDFURL = fileURL;

    showPDFViewer(fileURL, file.name, file);
}


/* =========================================================
   OPEN SAVED PDF
   ========================================================= */

async function openSavedPDF(pdfId) {

    try {
        const savedPDF = await getStoredPDF(pdfId);

        if (!savedPDF || !savedPDF.file) {
            alert("This saved PDF could not be found.");
            return;
        }

        const file = savedPDF.file;
        const fileURL = URL.createObjectURL(file);

        window.studyBookCurrentPDFFile = file;
        window.studyBookCurrentPDFURL = fileURL;

        showPDFViewer(fileURL, savedPDF.name, file);

    } catch (error) {
        console.error("Could not open the saved PDF:", error);
        alert("Could not open the saved PDF.");
    }
}


/* =========================================================
   PDF VIEWER
   ========================================================= */

function isMobileDevice() {
    return (
        /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
    );
}


async function openCurrentPDFWithApp() {

    const file = window.studyBookCurrentPDFFile;

    if (!file) {
        alert("PDF file is not available.");
        return;
    }

    const shared = await sharePDFFile(file);

    if (!shared) {
        alert("Your browser does not provide the app chooser for this PDF. Use 'Open in Browser' instead.");
    }
}


function showPDFViewer(fileURL, fileName, file) {

    window.studyBookCurrentPDFURL = fileURL;
    window.studyBookCurrentPDFFile = file || null;

    /*
       IMPORTANT:
       Mobile browsers are unreliable with PDF blob URLs inside iframes.
       Therefore the mobile version uses a normal browser tab plus the
       native app/share sheet. Desktop can still use the in-app viewer.
    */
    if (isMobileDevice()) {

        showModal(`
            <div style="text-align:center;">
                <h2 style="word-break:break-word;">
                    📄 ${escapeHTML(fileName)}
                </h2>

                <p style="color:#777;font-size:13px;line-height:1.6;">
                    Choose a PDF reader.
                </p>

                <a
                    href="${escapeAttribute(fileURL)}"
                    target="_blank"
                    rel="noopener"
                    class="modal-action"
                    style="display:block;text-align:center;text-decoration:none;box-sizing:border-box;">
                    📖 Open in Browser / PDF Viewer
                </a>

                <br>

                <button
                    class="modal-action"
                    onclick="openCurrentPDFWithApp()">
                    📤 Open with PDF App / Drive
                </button>

                <br><br>

                <button
                    class="back-btn"
                    style="width:100%;"
                    onclick="closePDFViewer()">
                    ← Back to StudyBook
                </button>
            </div>
        `);

        return;
    }

    /* Desktop: reliable in-page viewer + browser fallback. */
    showModal(`
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px;">
            <h2 style="margin:0;font-size:18px;word-break:break-word;">📄 ${escapeHTML(fileName)}</h2>
            <button class="back-btn" onclick="closePDFViewer()">← Back</button>
        </div>

        <iframe
            src="${escapeAttribute(fileURL)}"
            title="${escapeAttribute(fileName)}"
            style="display:block;width:100%;height:70vh;min-height:400px;border:1px solid #ddd;border-radius:12px;background:white;"
        ></iframe>

        <div style="margin-top:10px;text-align:center;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <a
                href="${escapeAttribute(fileURL)}"
                target="_blank"
                rel="noopener"
                style="display:inline-block;padding:10px 14px;border-radius:10px;background:#f1f3f8;color:#333;text-decoration:none;font-weight:600;">
                📖 Open in Browser
            </a>

            ${file ? `
                <button class="modal-action" style="width:auto;" onclick="openCurrentPDFWithApp()">
                    📤 Open with App
                </button>
            ` : ""}
        </div>
    `);
}


function closePDFViewer() {

    window.studyBookSelectedLocalPDF = null;
    window.studyBookCurrentPDFFile = null;

    if (window.studyBookCurrentPDFURL) {
        URL.revokeObjectURL(window.studyBookCurrentPDFURL);
        window.studyBookCurrentPDFURL = null;
    }

    closeModal();
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


function closeModal() {

    if (
        window.studyBookCurrentPDFURL
    ) {

        URL.revokeObjectURL(
            window.studyBookCurrentPDFURL
        );


        window.studyBookCurrentPDFURL =
            null;

    }


    getElement("modal")
        .classList.add(
            "hidden"
        );

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
