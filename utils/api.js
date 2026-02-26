// utils/api.js
const { get, post, put, del, uploadFile } = require('./request');

// ============ 用户模块 ============
const userApi = {
    // 微信授权登录
    wxLogin: (data) => post('/user/wx-login', data),
    // 发送短信验证码
    sendSmsCode: (data) => post('/user/send-sms', data),
    // 短信验证码登录
    smsLogin: (data) => post('/user/sms-login', data),
    // 获取手机号
    getPhone: (data) => post('/user/phone', data),
    // 获取当前用户信息
    getUserInfo: () => get('/user/info'),
    // 更新用户信息
    updateUserInfo: (data) => put('/user/info', data),
};

// ============ 首页模块 ============
const homeApi = {
    // 获取首页统计数据
    getStats: () => get('/home/stats'),
};

// ============ 设备模块 ============
const equipmentApi = {
    // 设备列表（分页+搜索）
    getList: (params) => get('/equipment/list', params),
    // 设备详情
    getDetail: (id) => get('/equipment/' + id),
    // 新增设备
    create: (data) => post('/equipment', data),
    // 修改设备
    update: (id, data) => put('/equipment/' + id, data),
    // 删除设备
    remove: (id) => del('/equipment/' + id),
    // 上传设备图片
    uploadImage: (filePath) => uploadFile('/equipment/image', filePath),
    // 删除设备图片
    deleteImage: (id) => del('/equipment/image/' + id),
    // 获取设备分类树
    getCategories: () => get('/equipment/category'),
    // 关注/取消关注设备
    toggleFollow: (id) => post('/equipment/follow/' + id),
};

// ============ 维修模块 ============
const repairApi = {
    // 维修工单列表
    getList: (params) => get('/repair/list', params),
    // 工单详情
    getDetail: (id) => get('/repair/' + id),
    // 创建维修工单（报修）
    create: (data) => post('/repair', data),
    // 派工
    assign: (id, data) => put('/repair/' + id + '/assign', data),
    // 开始维修
    start: (id) => put('/repair/' + id + '/start'),
    // 完成维修
    complete: (id, data) => put('/repair/' + id + '/complete', data),
    // 关闭工单
    close: (id) => put('/repair/' + id + '/close'),
    // 添加维修记录
    addRecord: (id, data) => post('/repair/' + id + '/record', data),
    // 我的工单
    getMyOrders: (params) => get('/repair/my', params),
};

// ============ 消息模块 ============
const messageApi = {
    // 消息列表
    getList: (params) => get('/message/list', params),
    // 消息详情
    getDetail: (id) => get('/message/' + id),
    // 手动推送消息
    push: (data) => post('/message/push', data),
    // 绑定公众号
    bindGzh: (data) => post('/message/bind-gzh', data),
};

// ============ 文件模块 ============
const fileApi = {
    // 通用文件上传
    upload: (filePath) => uploadFile('/file/upload', filePath),
};

module.exports = {
    userApi,
    homeApi,
    equipmentApi,
    repairApi,
    messageApi,
    fileApi
};

