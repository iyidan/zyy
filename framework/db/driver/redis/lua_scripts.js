/**
 * 存放lua脚本的module
 */

/**
 * 获取多个不同类型的键的值
 */
var getKeys = '\
local getMap={ hash="hgetall", string="get", none="none", list="lrange", set="smembers", zset="zrange" };\
local results={};\
local tmpType;\
local tmpCmd;\
for i=1,i<=table.getn(KEYS) do\
  tmpType=redis.pcall("type", KEYS[i]);\
  tmpCmd=getMap[tmpType];\
  if tmpCmd=="none" then\
    results[i]=nil;\
  elseif tmpCmd=="lrange" or tmpCmd=="zrange" then\
    results[i]=redis.pcall(tmpCmd, KEYS[i], 0, -1);\
  else\
    results[i]=redis.pcall(tmpCmd, KEYS[i]);\
  end\
end\
return results;';

/**
 * 设置/更新多个key的值
 */
var updateKeys = '\
local results={};\
for i=1,i<=table.getn(KEYS) do\
  results[i]=redis.pcall("set", KEYS[i], ARGV[i]);\
end\
return results;';


module.exports = {
  'getKeys': getKeys,
  'updateKeys': updateKeys,
};