const XLSX = require("xlsx");

export function getExcelData(result, examId, grade) {
    let data = []
    const workbook = XLSX.read(result, {type: 'array'});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const sheetData = XLSX.utils.sheet_to_json(worksheet)
    const title = Object.keys(sheetData[0])[0]
    for (let i = 2; i < sheetData.length - 2; i++) {
        const rowData = sheetData[i]
        if (rowData[title] === "总分") {
            break
        }
        const resRow = {}
        resRow.studentNum = rowData[title]
        resRow.class = getCell(rowData, '__EMPTY')
        if (!resRow.class) {
            continue
        }
        resRow.grade = grade
        resRow.exam_id = examId
        resRow.name = getCell(rowData, '__EMPTY_1')
        resRow.chinese = getCell(rowData, '__EMPTY_2', 0)
        resRow.math = getCell(rowData, '__EMPTY_3', 0)
        resRow.english = getCell(rowData, '__EMPTY_4', 0)
        resRow.daoism = getCell(rowData, '__EMPTY_5', 0)
        resRow.science = getCell(rowData, '__EMPTY_6', 0)
        resRow.total = resRow.chinese + resRow.math + resRow.english + resRow.daoism + resRow.science
        data.push(resRow)
    }
    return data
}


// eslint-disable-next-line no-unused-vars
function addScoreRank(students) {
    console.log("addScoreRank", "addScoreRank")
    const subject = ['chinese', 'math', 'english', 'daoism', 'science', 'total']
// 1. 对每个班级的学生进行排名计算
    students.forEach((student) => {
        subject.forEach((subject) => {
            const rankKey = `${subject}ClassRank`;
            const subjectScore = student[subject];
            if (!Object.prototype.hasOwnProperty.call(student, rankKey)) {
                student[rankKey] = 1;
                const comparedScores = []
                students.filter(item => item.grade === student.grade && item.class === student.class).forEach((item) => {
                    if (item[subject] > subjectScore && comparedScores.indexOf(item[subject]) === -1) {
                        // 如果当前科目的成绩低于前一位学生，则排名需要递增
                        student[rankKey] += 1;
                        comparedScores.push(item[subject])
                    }
                });
            }
        });
    });

// 2. 对每个年级的学生进行排名计算
    students.forEach((student) => {
        // const key = `${student.grade}`; // 确定该学生所处的年级
        subject.forEach((subject) => {
            const rankKey = `${subject}GradeRank`;
            const subjectScore = student[subject];
            const comparedScores = []
            if (!Object.prototype.hasOwnProperty.call(student, rankKey)) {
                student[rankKey] = 1;
                students.filter(item => item.grade === student.grade).forEach((item) => {
                    if (item[subject] > subjectScore && comparedScores.indexOf(item[subject]) === -1) {
                        // 如果当前科目的成绩低于前一位学生，则排名需要递增
                        student[rankKey] += 1;
                        comparedScores.push(item[subject])
                    }
                });
            }
        });
    });


}


function getCell(rowData, key, defaultData) {
    let cell = rowData[key]
    if (typeof cell === "string") {
        cell = cell.trim()
    }
    if (cell === "缺考") {
        cell = 0
    }
    if (!cell && defaultData !== undefined) {
        cell = defaultData
    }
    return cell
}
