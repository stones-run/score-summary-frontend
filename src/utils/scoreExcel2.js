// const XLSX = require("xlsx");
//
// export function getExcelData(result, examId, grade, class_, cache_data, cache_name) {
//     let data = []
//     const workbook = XLSX.read(result, {type: 'array'});
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]]
//     const sheetData = XLSX.utils.sheet_to_json(worksheet)
//     const sheet_to_formulae = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: '', blankrows:false})
//     console.log("sheet_to_formulae", sheet_to_formulae)
//     const studentNumKey = Object.keys(sheetData[0])[0]
//     let title = Object.values(sheetData[1])
//     let target1 = ["学号", "班级", "姓名", "语文", "数学", "英语", "道法", "科学"]
//     let result1 = title.slice(0, 8).every(function (item, index) {
//         return item.toString().replace(/\s+/g, "") === target1[index];
//     })
//     let target2 = ["学号", "姓名", "语文", "数学", "英语", "道法", "科学"]
//     let result2 = title.slice(0, 7).every(function (item, index) {
//         return item.toString().replace(/\s+/g, "") === target2[index];
//     })
//     let target3 = ["学号", "姓名", "性别", "语文", "数学", "英语", "道法", "科学"]
//     let result3 = title.slice(0, 8).every(function (item, index) {
//         return item.toString().replace(/\s+/g, "") === target3[index];
//     })
//     if (!result1 && !result2 && !result3) {
//         return "表头异常"
//     }
//
//     for (let i = 2; i < sheetData.length - 2; i++) {
//         const rowData = sheetData[i]
//         const resRow = {}
//         resRow.studentNum = rowData[studentNumKey]
//         if (!resRow.studentNum || typeof resRow.studentNum !== "number") {
//             continue
//         }
//         resRow.class = class_
//         resRow.grade = grade
//         resRow.exam_id = examId
//         if (result2) {
//             resRow.name = getCell(rowData, '__EMPTY')
//             resRow.chinese = getCell(rowData, '__EMPTY_1', 0)
//             resRow.math = getCell(rowData, '__EMPTY_2', 0)
//             resRow.english = getCell(rowData, '__EMPTY_3', 0)
//             resRow.daoism = getCell(rowData, '__EMPTY_4', 0)
//             resRow.science = getCell(rowData, '__EMPTY_5', 0)
//         } else if (result1) {
//             resRow.name = getCell(rowData, '__EMPTY_1')
//         } else {
//             resRow.name = getCell(rowData, '__EMPTY')
//         }
//         resRow.chinese = getCell(rowData, '__EMPTY_2', 0)
//         resRow.math = getCell(rowData, '__EMPTY_3', 0)
//         resRow.english = getCell(rowData, '__EMPTY_4', 0)
//         resRow.daoism = getCell(rowData, '__EMPTY_5', 0)
//         resRow.science = getCell(rowData, '__EMPTY_6', 0)
//         if (!resRow.name || resRow.name.length === 0) {
//             continue
//         }
//         if (cache_data) {
//             if (cache_data[i - 2].student_num !== resRow.studentNum) {
//                 return `在【${resRow.name}】处发现不同，：请对比《${cache_name}》`
//             }
//             if (resRow.chinese === 0) {
//                 resRow.chinese = cache_data[i - 2].score.chinese
//             }
//             if (resRow.math === 0) {
//                 resRow.math = cache_data[i - 2].score.math
//             }
//             if (resRow.english === 0) {
//                 resRow.english = cache_data[i - 2].score.english
//             }
//             if (resRow.daoism === 0) {
//                 resRow.daoism = cache_data[i - 2].score.daoism
//             }
//             if (resRow.science === 0) {
//                 resRow.science = cache_data[i - 2].score.science
//             }
//         }
//         // resRow.total = resRow.chinese + resRow.math + resRow.english + resRow.daoism + resRow.science
//         let score = {
//             grade: grade,
//             exam_id: examId,
//             student_name: resRow.name,
//             student_num: resRow.studentNum,
//             class: resRow.class,
//             score: {
//                 chinese: resRow.chinese,
//                 math: resRow.math,
//                 english: resRow.english,
//                 daoism: resRow.daoism,
//                 total: resRow.total,
//                 science: resRow.science,
//             }
//         }
//         data.push(score)
//     }
//     return data
// }
//
//
// export function addScoreRank(students) {
//     console.log("addScoreRank", "addScoreRank")
//     const subject = ['chinese', 'math', 'english', 'daoism', 'science', 'total']
// // 1. 对每个班级的学生进行排名计算
//     students.forEach((student) => {
//         subject.forEach((subject) => {
//             const rankKey = `${subject}ClassRank`;
//             const subjectScore = student[subject];
//             if (!Object.prototype.hasOwnProperty.call(student, rankKey)) {
//                 student[rankKey] = 1;
//                 const comparedScores = []
//                 students.filter(item => item.grade === student.grade && item.class === student.class).forEach((item) => {
//                     if (item[subject] > subjectScore && comparedScores.indexOf(item[subject]) === -1) {
//                         // 如果当前科目的成绩低于前一位学生，则排名需要递增
//                         student[rankKey] += 1;
//                         comparedScores.push(item[subject])
//                     }
//                 });
//             }
//         });
//     });
//
// // 2. 对每个年级的学生进行排名计算
//     students.forEach((student) => {
//         // const key = `${student.grade}`; // 确定该学生所处的年级
//         subject.forEach((subject) => {
//             const rankKey = `${subject}GradeRank`;
//             const subjectScore = student[subject];
//             const comparedScores = []
//             if (!Object.prototype.hasOwnProperty.call(student, rankKey)) {
//                 student[rankKey] = 1;
//                 students.filter(item => item.grade === student.grade).forEach((item) => {
//                     if (item[subject] > subjectScore && comparedScores.indexOf(item[subject]) === -1) {
//                         // 如果当前科目的成绩低于前一位学生，则排名需要递增
//                         student[rankKey] += 1;
//                         comparedScores.push(item[subject])
//                     }
//                 });
//             }
//         });
//     });
//
//
// }
//
//
// function getCell(rowData, key, defaultData) {
//     let cell = rowData[key]
//     if (typeof cell === "string") {
//         cell = cell.trim()
//     }
//     if (defaultData !== undefined) {
//         if (typeof cell !== typeof defaultData || !cell) {
//             cell = defaultData
//         }
//     }
//     return cell
// }
