package com.plugin.backend

fun getMajorWebViewNumber(versionString: String?): Int? {
    // 处理 null 或空字符串
    if (versionString.isNullOrEmpty()) {
        return null
    }

    // 使用 '.' 分割字符串，并安全地获取第一个部分
    // firstOrNull() 是一个 Kotlin 集合函数，如果列表为空则返回 null
    val majorVersionPart = versionString.split('.').firstOrNull()

    // 检查第一个部分是否有效
    if (majorVersionPart.isNullOrEmpty()) {
        return null
    }

    // 尝试将第一个部分转换为 Int 类型
    // toIntOrNull() 是 Kotlin 中安全转换 Int 的推荐方法，
    // 它会在转换失败（例如 "abc"）时返回 null，而不是抛出异常。
    val majorVersionNumber = majorVersionPart.toIntOrNull()

    // 检查转换结果是否有效且大于等于 0
    // majorVersionNumber 已经是 Int? 类型，如果为 null，则下面的返回语句会处理它。
    return if (majorVersionNumber != null && majorVersionNumber >= 0) {
        majorVersionNumber
    } else {
        null
    }
}
