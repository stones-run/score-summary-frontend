const XLSX = require("xlsx");

function getIndex(titleRow) {
    const indexMap = {
        studentNum: null,
        name: null,
        chinese: null,
        math: null,
        english: null,
        daoism: null,
        science: null
    }
    for (let col = 0; col < titleRow.length; col++) {
        let value = titleRow[col].toString().replace(/\s+/g, "")
        if (value === "学号") {
            indexMap.studentNum = col
        } else if (value === "姓名") {
            indexMap.name = col
        } else if (value === "语文") {
            indexMap.chinese = col
        } else if (value === "数学") {
            indexMap.math = col
        } else if (value === "英语") {
            indexMap.english = col
        } else if (value === "道法") {
            indexMap.daoism = col
        } else if (value === "科学") {
            indexMap.science = col
        }
    }
    if (indexMap.studentNum == null || indexMap.name == null) {
        return null
    }
    if (indexMap.chinese == null && indexMap.math == null
        && indexMap.english == null && indexMap.daoism == null && indexMap.science == null) {
        return null
    }
    return indexMap
}

export function getExcelData(result, examId, grade, class_, cache_data, cache_name) {
    let data = []
    const workbook = XLSX.read(result, {type: 'array'});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const sheetData = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: '', blankrows: false})
    const titleRow = sheetData[2]
    const indexMap = getIndex(titleRow)
    if (!indexMap) {
        return "表头异常，第三行应包含学号和姓名以及最少一门科目名"
    }
    const studentRow = sheetData.splice(3)
    console.log("studentRow", studentRow)

    for (let i = 0; i < studentRow.length; i++) {
        const rowData = studentRow[i]
        const resRow = {}
        resRow.class = class_
        resRow.grade = grade
        resRow.exam_id = examId
        resRow.studentNum = getCell(rowData, indexMap.studentNum)
        resRow.name = getCell(rowData, indexMap.name)
        console.log("i1", i)
        if (!resRow.studentNum || typeof resRow.studentNum !== "number") {
            continue
        }
        if (!resRow.name || typeof resRow.name !== "string") {
            continue
        }
        resRow.chinese = getCell(rowData, indexMap.chinese, 0)
        resRow.math = getCell(rowData, indexMap.math, 0)
        resRow.english = getCell(rowData, indexMap.english, 0)
        resRow.daoism = getCell(rowData, indexMap.daoism, 0)
        resRow.science = getCell(rowData, indexMap.science, 0)
        if (cache_data) {
            if (cache_data[i].student_num !== resRow.studentNum) {
                return `在【${resRow.name}】处发现不同，：请对比《${cache_name}》`
            }
            if (resRow.chinese === 0) {
                resRow.chinese = cache_data[i].score.chinese
            }
            if (resRow.math === 0) {
                resRow.math = cache_data[i].score.math
            }
            if (resRow.english === 0) {
                resRow.english = cache_data[i].score.english
            }
            if (resRow.daoism === 0) {
                resRow.daoism = cache_data[i].score.daoism
            }
            if (resRow.science === 0) {
                resRow.science = cache_data[i].score.science
            }
        }
        // resRow.total = resRow.chinese + resRow.math + resRow.english + resRow.daoism + resRow.science
        let score = {
            grade: grade,
            exam_id: examId,
            student_name: resRow.name,
            student_num: resRow.studentNum,
            class: resRow.class,
            score: {
                chinese: resRow.chinese,
                math: resRow.math,
                english: resRow.english,
                daoism: resRow.daoism,
                total: resRow.total,
                science: resRow.science,
            }
        }
        data.push(score)
    }
    return data
}

function getCell(rowData, index, defaultData) {
    if (index == null) {
        return defaultData
    }
    let cell = rowData[index]
    if (typeof cell === "string") {
        cell = cell.trim()
    }
    if (defaultData !== undefined) {
        if (typeof cell !== typeof defaultData || !cell) {
            cell = defaultData
        }
    }
    return cell
}
