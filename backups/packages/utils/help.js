/**
 * 重写对象上面的某个属性
 * @param {*} source 需要被重写的对象
 * @param {*} name 需要被重写对象的key
 * @param {*} replacement 以原有的函数作为参数，执行并重写原有函数
 * @param {*} isForced
 */
export function replaceOld(source, name, replacement, isForced = false) {
	if (name in source || isForced) {
		const original = source[name];
		const wrapped = replacement(original);
		if (typeof wrapped === 'function') {
			source[name] = wrapped;
		}
	}
}

/**
 * 解析字符串错误信息，返回message、name、stack
 * @param str error string
 */
export function parseErrorString(str) {
	const splitLine = str.split('\n')
	if (splitLine.length < 2) return null
	if (splitLine[0].indexOf('MiniProgramError') !== -1) {
		splitLine.splice(0, 1)
	}
	const message = splitLine.splice(0, 1)[0]
	const name = splitLine.splice(0, 1)[0].split(':')[0]
	const stack = []
	splitLine.forEach((errorLine) => {
		const regexpGetFun = /at\s+([\S]+)\s+\(/ // 获取 [ 函数名 ]
		const regexGetFile = /\(([^)]+)\)/ // 获取 [ 有括号的文件 , 没括号的文件 ]
		const regexGetFileNoParenthese = /\s+at\s+(\S+)/ // 获取 [ 有括号的文件 , 没括号的文件 ]

		const funcExec = regexpGetFun.exec(errorLine)
		let fileURLExec = regexGetFile.exec(errorLine)
		if (!fileURLExec) {
			// 假如为空尝试解析无括号的URL
			fileURLExec = regexGetFileNoParenthese.exec(errorLine)
		}

		const funcNameMatch = Array.isArray(funcExec) && funcExec.length > 0 ? funcExec[1].trim() : ''
		const fileURLMatch = Array.isArray(fileURLExec) && fileURLExec.length > 0 ? fileURLExec[1] : ''
		const lineInfo = fileURLMatch.split(':')
		stack.push({
			args: [], // 请求参数
			func: funcNameMatch || "UNKNOWN_FUNCTION", // 前端分解后的报错
			lineno: Number(lineInfo.pop()), // 前端分解后的列
			colno: Number(lineInfo.pop()), // 前端分解后的行
			url: lineInfo.join(':') // 前端分解后的URL
		})
	})
	return {
		message,
		name,
		stack
	}
}