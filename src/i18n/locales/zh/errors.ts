const errors = {
  "validation": {
    "required": "{field}不能为空",
    "minLength": "{field}至少需要{min}个字符",
    "maxLength": "{field}不能超过{max}个字符",
    "format": "{field}格式不正确"
  },
  "character": {
    "name": {
      "tooShort": "角色名称至少需要2个字符",
      "tooLong": "角色名称不能超过12个字符",
      "invalid": "角色名称只能包含字母、数字和下划线"
    },
    "class": {
      "required": "请选择角色职业"
    }
  }
}

export default errors 