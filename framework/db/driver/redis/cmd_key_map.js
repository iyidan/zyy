/**
 * redis命令对应key所在的位置，
 * 用于NS组装key
 */

//////////////////////////////////////////////////////////////////
//
//  [命令参数]
//    数组中第一个元素包含两个值，key的起始位置，key的数量
//    
//  [返回数据]
//    数组中第二个元素包含两个值，key的起始位置，key的结束位置
//    
//  [特殊字符]
//    '?': 需要程序动态判断：如命令 eval evalsha
//    '*': 表示全部
//    '+': 起始位置key间隔1
//  
//////////////////////////////////////////////////////////////////

module.exports = {

"append"            :[ 1, false],

"auth"              :false,

"bgrewriteaof"      :false,

"bgsave"            :false,

"bitcount"          :[ 1, false ],

"bitop"             :[ [1, '*'], false ],

"blpop"             :[ [0, -1], 1 ],

"brpop"             :[ [0, -1], 1 ],

"brpoplpush"        :[ [0, 2], false ],

"client kill"       :false,

"client list"       :false,

"config get"        :false,

"config set"        :false,

"config resetstat"  :false,

"dbsize"            :false,

"debug object"      :[ 1, false ],

"debug segfault"    :false,

"decr"              :[ 1, false ],

"decrby"            :[ 1, false ],

"del"               :[ [0, '*'], false ],

"discard"           :false,

"dump"              :[ 1, false ],

"echo"              :false,

"eval"              :'?',

"evalsha"           :'?',

"exec"              :false,

"exists"            :[ 1, false ],

"expire"            :[ 1, false ],

"expireat"          :[ 1, false ],

"flushall"          :false,

"flushdb"           :false,

"get"               :[ 1, false ],

"getbit"            :[ 1, false ],

"getrange"          :[ 1, false ],

"getset"            :[ 1, false ],

"hdel"              :[ 1, false ],

"hexists"           :[ 1, false ],

"hget"              :[ 1, false ],

"hgetall"           :[ 1, false ],

"hincrby"           :[ 1, false ],

"hincrbyfloat"      :[ 1, false ],

"hkeys"             :[ 1, false ],

"hlen"              :[ 1, false ],

"hmget"             :[ 1, false ],

"hmset"             :[ 1, false ],

"hset"              :[ 1, false ],

"hsetnx"            :[ 1, false ],

"hvals"             :[ 1, false ],

"incr"              :[ 1, false ],

"incrby"            :[ 1, false ],

"incrbyfloat"       :[ 1, false ],

"info"              :false,

"keys"              :[ false, [0, '*'] ],

"lastsave"          :false,

"lindex"            :[ 1, false ],
"linsert"           :[ 1, false ],
"llen"              :[ 1, false ],
"lpop"              :[ 1, false ],
"lpush"             :[ 1, false ],
"lpushx"            :[ 1, false ],
"lrange"            :[ 1, false ],
"lrem"              :[ 1, false ],
"lset"              :[ 1, false ],
"ltrim"             :[ 1, false ],

"mget"              :[ [0, '*'], false ],

"migrate"           :[ [2, 1], false ],

"monitor"           :false,

"move"              :[ 1, false ],

"mset"              :[ [0, '+'], false ],
"msetnx"            :[ [0, '+'], false ],

"multi"             :false,

"object"            :[ [1, 0], false ],

"persist"           :[ 1, false ],

"pexpire"           :[ 1, false ],
"pexpireat"         :[ 1, false ],

"ping"              :false,
"psetex"            :[ 1, false ],

"psubscribe"        :false,

"pttl"              :[ 1, false ],
"publish"           :false,
"punsubscribe"      :false,

"quit"              :false,

"randomkey"         :[ false, 1 ],

"rename"            :[ [0, 2], false ],
"renamenx"          :[ [0 ,2], false ],
"restore"           :[ 1, false ],
"rpop"              :[ 1, false ],
"rpoplpush"         :[ [0, 2], false ],
"rpush"             :[ 1, false ],
"rpushx"            :[ 1, false ],

"save"              :false,

"sadd"              :[ 1, false ],
"scard"             :[ 1, false ],

"script exists"     :false,
"script flush"      :false,
"script kill"       :false,
"script load"       :false,

"sdiff"             :[ [0, '*'], false ],
"sdiffstore"        :[ [0, '*'], false ],
"select"            :false,
"set"               :[ 1, false ],
"setbit"            :[ 1, false ],
"setex"             :[ 1, false ],
"setnx"             :[ 1, false ],
"setrange"          :[ 1, false ],

"shutdown"          :false,

"sinter"            :[ [0, '*'], false ],
"sinterstore"       :[ [0, '*'], false ],
"sunion"            :[ [0, '*'], false ],
"sunionstore"       :[ [0, '*'], false ],
"sismember"         :[ 1, false ],

"slaveof"           :false,
"slowlog"           :false,

"smembers"          :[ 1, false ],
"smove"             :[ [0, 2], false ],
"sort"              :[ 1, false ],
"spop"              :[ 1, false ],
"srandmember"       :[ 1, false ],
"srem"              :[ 1, false ],
"strlen"            :[ 1, false ],

"subscribe"         :false,

"sync"              :false,

"time"              :false,

"ttl"               :[ 1, false ],
"type"              :[ 1, false ],

"unsubscribe"       :false,

"unwatch"           :false,
"watch"             :[ [0, '*'], false ],

"zadd"              :[ 1, false ],
"zcard"             :[ 1, false ],
"zcount"            :[ 1, false ],
"zincrby"           :[ 1, false ],
"zinterstore"       :'?',
"zrange"            :[ 1, false ],
"zrangebyscore"     :[ 1, false ],
"zrank"             :[ 1, false ],
"zrem"              :[ 1, false ],
"zremrangebyrank"   :[ 1, false ],
"zremrangebyscore"  :[ 1, false ],
"zrevrange"         :[ 1, false ],
"zrevrangebyscore"  :[ 1, false ],
"zrevrank"          :[ 1, false ],
"zscore"            :[ 1, false ],
"zunionstore"       :'?'

};