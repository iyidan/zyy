/**
 * 存放lua脚本的module
 */

/**
 * 获取多个不同类型的键的值
 */
var getKeys = '\
local getMap={ hash="hgetall", string="get", none="none", list="lrange", set="smembers", zset="zrange" }; \
local results={}; \
local tmpType; \
local tmpCmd=""; \
for i=1,table.getn(KEYS) do \
  tmpType=redis.pcall("type", KEYS[i])["ok"]; \
  tmpCmd=getMap[tmpType]; \
  if tmpCmd=="none" then \
    results[i]=nil; \
  elseif tmpCmd=="lrange" or tmpCmd=="zrange" then \
    results[i]=redis.pcall(tmpCmd, KEYS[i], 0, -1); \
  else \
    results[i]=redis.pcall(tmpCmd, KEYS[i]); \
  end \
end \
return results;';

/**
 * 设置/更新多个key的值
 */
var updateKeys = '\
local results={}; \
for i=1,table.getn(KEYS) do \
  results[i]=redis.pcall("set", KEYS[i], ARGV[i]); \
end \
return results;';


/**
 * 删除某个前缀开头的所有key
 */
var delKeys = 'return redis.pcall("del", unpack(redis.pcall("keys", KEYS[1] .. "*")));';


/**
 * 创建keys
 */
var createKeys = '\
local results={}; \
local keyPre=ARGV[table.getn(ARGV)]; \
local id=redis.pcall("incr",  keyPre .. ":__counter__"); \
for i=1,table.getn(KEYS) do \
  results[i]=redis.pcall("set",  keyPre .. ":" .. id .. ":" .. KEYS[i], ARGV[i]); \
end \
return {id, results};';


module.exports = {
  'getKeys': getKeys,
  'updateKeys': updateKeys,
  'delKeys': delKeys,
  'createKeys': createKeys
};