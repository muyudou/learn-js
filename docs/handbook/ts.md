---
title: ts小册总结
author: muyudou
date: '2023-10-30'
---

# 背景

记得有一次面试字节（我发现字节挺喜欢考ts的），出了ts的类型编程，当然了没写出来，就没下文了。。。所以一直耿耿于怀，心里就埋下了个疙瘩，想的还是需要把这部分攻克一下，因此开始了ts小册的学习，买了2本小册，准备啃一啃，啃了2本发现神光的[TypeScript 类型体操通关秘籍](https://juejin.cn/book/7047524421182947366/section)小册总结的类型体操还是不错的，适合入门。所以痛下决心（逼不得已）总结一下。总结前先把ts面试题发下：

1. Pick实现、Partial实现

这个挺基础的，但是确实不会，遂挂了。

2. 补充以下类型，提示出来对象的key

```js
function a(o,key) {
    return o[key]
}
```

这个题目约束key是o的属性，不是的话可以报错，还是有用的，关键要加范型。

同志们，会吗？如果你实际项目中用到了ts，这些基础的ts类型编程还是值得掌握一下的。不会的话就去复习吧，否则这个问题你就挂了。

**答案**


```js
type myPick<T extends Record<string, any>, K extends keyof T> = {
    [P in K]: T[P]
}

type myPartial<T extends Record<string, any>> = {
    [P in T]?: T[P]
}
```


```js
function a<T extends object, K extends keyof T>(o: T, key: K) {
    return o[key]
}

var obja = {
    a:1,
    b:2
}

a(obja, 'a')
a(obja, 'd') // ts报错：类型“"d"”的参数不能赋给类型“"a" | "b"”的参数。

```

学了这个小册后，我的感受是不要求把所有的体操类型都掌握（学习过程太折磨了，产生了人生怀疑🤨），但是内置的高级类型的写法还是值得掌握的，对于应付面试是差不多了。如果需要对库进行ts类型编写的的话，可以好好啃啃高级写法。

剩下内容主要是小册总结，这个类型编程上手成本有点高，之前写项目也用ts，但是我最多用个record和partial高级类型，其他的基本是inferface加enum，类型编程统统没用到。

所以这个小册反反复复看几遍后差不多有点感觉，能写出来点了，好像入门了。其实现在觉得ts这部分实在是不友好，为了写类型学这么多奇奇怪怪的东西，成本是高的，所以是不是有点理解为啥有的框架从ts换成了jsdoc？

# 一、基础类型

先了解下ts中的基础类型，基本是从js中搬过来，然后又加了元组（Tuple）、接口（Interface）、枚举（Enum），这部分没什么难度，我们用ts这部分用的最多。

| 类型 |  具体 |
| --- | --- |
| 和js一样的基础类型8个 | number、boolean、string、object、bigint、symbol、undefined、null  |
| 基础类型对应的包装类型5个 | Number、Boolean、String、Object、Symbol |
| 与js一样的复合类型 |  class、Array |
| 特有的复合类型 | 元组（Tuple）、接口（Interface）、枚举（Enum） |

## 接口

### 函数的两种声明方式

1. 接口interface
2. 直接写在函数声明上

```js
interface SayHello {
    (name: string): string;
}

const func: SayHello = (name: string) => {
    return 'hello, ' + name;
}
```

### 构造函数声明

相对于普通函数多了个new

```js
interface PersonConstructor {
    new (name: string, age: number): IPerson;
}

function createPerson(ctor: PersonConstructor): IPerson {
    return new ctor('guang', 18)
}
```

对象类型、class 类型在 TypeScript 里也叫做索引类型，也就是索引了多个元素的类型的意思。对象可以动态添加属性，如果不知道会有什么属性，可以用可索引签名：


```js
interface IPerson {
    [prop: string]: string | number;
}

const obj: IPerson = {};
obj.name = 'xu'
```

#### 特殊类型

1. never：代表不可达，函数抛出异常的时候，返回值就是never
2. void：代表空，可以是undefined 或never
3. any：任意类型。任何类型都可以赋值给它，它也可以赋值给任何类型
4. unknown：未知类型，任何类型都可以赋值给它，**但是它不能赋值给任何其他类型**

# 二、类型操作

这部分就涉及到类型编程了，下面几个基础的操作要掌握一下：

1. 条件 extends?:

```ts
type res = 1 extends 2 ? true : false
```

2. 推导： infer


```js
type First<Tuple extends unknown[]> = Tuple extends [infer T, ...infer R] ? T : never;

type res = First<['1', 2, 3]>
```

3. 联合： ｜
4. 交叉： &

同一类型可以合并，不同类型不能合并：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2fc2868c32b4159966f2fda72251f5b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=396&h=110&s=29184&e=png&b=f8f7f7)

5. 映射类型

这个用到的还是很多的，一定要掌握。

```js
type MapType<T> = {
    [Key in keyof T]: [T[Key], T[Key], T[Key]]
}

type res2 = MapType<{a: 1, b: 2}> 

```

索引重映射: 关键是as

keyof T取出的索引类型是string | number | symbol 的联合类型，和 string 取交叉部分就只剩下 string 了。交叉类型把同类型合并，不同的舍弃。

```js
type MapType2<T> = {
    [Key in keyof T as `${Key & string}${Key & string}${Key & string}`]: [T[Key], T[Key], T[Key]]
}

type res3 = MapType2<{a: 1, b: 2}> 
```

# 三、类型编程

下面就进入类型编程部分，这部分看了有3遍，才模模糊糊的自己能写出来一些，如果不想看的话可以看最后内置高级类型，这个还是很重要的，需要掌握啊，同志们。

这部分小册还总结了顺口令，分了6个部分来写。

**类型体操顺口溜**

**模式匹配做提取，重新构造做变换。**

**递归复用做循环，数组长度做计数。**

**联合分散可简化，特殊特性要记清。**

**基础扎实套路熟，类型体操可通关。**

按照这个来刷，确实还是有用的，想学习类型体操的可以刷一刷。

## 1. 模式匹配做提取 infer

主要是用infer来匹配参数

### 数组相关操作

```js
// 获取第一个元素
type GetFirst<Arr extends unknown[]> = 
    Arr extends [infer First, ...unknown[]] ? First : never;
type res = GetFirst<[1, 2, 3]>

// 获取最后一个元素
type GetLast<Arr extends unknown[]> =
    Arr extends [...unknown[], infer Last] ? Last : never;
type res2 = GetLast<[1, 2, 3]>

// 去除最后一个元素后构造数组
type PopArr<Arr extends unknown[]> =
    Arr extends [...infer newArr, unknown] ? newArr : never;
type res4 = PopArr<[1, 2, 3]>

// 去除第一个元素后的数组
type ShiftArr<Arr extends unknown[]> =
    Arr extends [unknown, ...infer newArr] ? newArr : never;
type res5 = ShiftArr<[1, 2, 3]>
```

### 字符串相关操作

```js
// 是否以某个字符开头
type StartsWith<Str extends string, Prefix extends string> =
    Str extends `${Prefix}${string}` ? true : false;
type res6 = StartsWith<'abcd', 'ab'>

// 替换字符
type ReplaceStr<Str extends string, From extends string, To extends string> =
    Str extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Suffix}` : Str
type res7 = ReplaceStr<'abcd', 'bc', 'dd'>

// 去除右边的空格
type TrimRight<Str extends string> =
    Str extends `${infer Last}${' ' | '\n' | '\t'}` ? TrimRight<Last> : Str
type res8 = TrimRight<'abc  \n '>

// 去除左边的空格
type TrimLeft<Str extends string> =
    Str extends `${' ' | '\n' | '\t'}${infer Last}` ? TrimLeft<Last> : Str
type res9 = TrimLeft<'  \n abc'>

// 去除左右两边空格
type TrimStr<Str extends string> = TrimRight<TrimLeft<Str>>
type TrimResult = TrimStr<'   abc    '>
```

### 函数

```js
// 匹配函数参数
type GetParameters<Func extends Function> =
    Func extends (...args: infer Args) => unknown ? Args : never

type res10 = GetParameters<(name: string, age: number) => string>

// 获取函数返回值
type GetReturnType<Func extends Function> =
    Func extends (...args: any[]) => infer R ? R : never
type res11 = GetReturnType<(name: string, age: number) => string>

interface Person {
    name: string
}

interface PersonConstructor {
    new(name: string): Person
}

// 获取构造函数this值
type GetInstanceType<ConstructorType extends new (...args: any) => any>
    = ConstructorType extends new (...args: any) => infer InstanceType ? InstanceType : any;

type GetInstanceTypeRes = GetInstanceType<PersonConstructor>

// 获取构造函数参数
type GetConstructorParameters<ConstructorType extends new (...args: any) => any>
    = ConstructorType extends new (...args: infer Args) => any ? Args : any
type GetConstructorParametersRes = GetConstructorParameters<PersonConstructor>
```

## 2. 重新构造做变换

声明任意类型的方式
1. type：类型别名
2. infer：提取类型到变量
3. 类型参数： 范型

以上三种类型声明的变量都不能修改，如果要变换Chans新的类型需要重新构造。

### 数组类型

```js
// 数组后添加元素
type Push<Arr extends unknown[], Ele> = [...Arr, Ele];
type PushResult2 = Push<[1, 2, 3], 4>

// 数组前添加元素
type Unshift<Arr extends unknown[], Ele> = [Ele, ...Arr];
type UnshiftResult2 = Unshift<[1, 2, 3], 4>

// 交叉合并数组
type Zip2<One extends unknown[], other extends unknown[]> =
    One extends [infer FirstOne, ...infer FirstLast]
        ? other extends [infer OtherOne, ...infer OtherLast]
            ? [[FirstOne, OtherOne], ...Zip2<FirstLast, OtherLast>] : []
                : []

type zip2Result2 = Zip2<[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]>
```

### 字符串

```js
// 首字母大写
type CapitalizeStr<Str extends string> =
    Str extends `${infer First}${infer Last}` ? `${Uppercase<First>}${Last}}` : Str;

// 下划线分隔的首字母大写
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}` : Str
type CamelCaseRes = CamelCase<'a_na_ya'>


// 删除某个字符
type DropSubStr<Str extends string, SubStr extends string>
    = Str extends `${infer Left}${SubStr}${infer Right}` ? DropSubStr<`${Left}${Right}`, SubStr> : Str;
type DropSubStrRes = DropSubStr<'abcdefbcg', 'bc'>
```

### 函数

```js
// 已有函数上添加一个参数
type AppendArgument<Func extends Function, Arg> =
    Func extends (...args: infer Args) => infer R ? (...args: [...Args, Arg]) => R : never
type AppendArgumentRes = AppendArgument<(a: string) => string, number>
```

### 索引类型

```js
type myRecord<K extends string | number | symbol, T> = {[P in K]: T}

// 索引类型的key变为大写
type UppercaseKey<Obj extends myRecord<string, any>> = {
    [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
}

type UppercaseKeyRes = UppercaseKey<{a: 1, bb: 1}>

// 变可读
type ToReadonly<T> = {
    readonly [Key in keyof T]: T[Key]
}

// 变可选
type ToPartial<T> = {
    [Key in keyof T]?: T[Key]
}

// 去掉readonly
type ToMutable<T> = {
    -readonly [Key in keyof T]: T[Key]
}

// 变成必选
type ToRequired<T> = {
    [Key in keyof T]-?: T[Key]
}

// 对索引做修改的as叫做重映射
type FilterByValueType<Obj extends Record<string, any>, ValueType> =
    {
        [Key in keyof Obj as Obj[Key] extends ValueType ? Key : never] : Obj[Key]
    }

type FilterByValueTypeRes = FilterByValueType<{a: string, b: number}, string>
```

## 3. 递归复用做循环

```js
// 深层promise提取
type DeepPromiseValueType<P extends Promise<unknown>> =
    P extends Promise<infer valueType>
        ? valueType extends Promise<unknown>
            ? DeepPromiseValueType<valueType>
            : valueType
        : never;

type ttt = Promise<Promise<Promise<Record<string, any>>>>;
type PromiseRes = DeepPromiseValueType<ttt>

```

### 数组


```js
// 逆序数组
type ReverseArr<Arr extends unknown[]> = 
    Arr extends [infer One, ...infer Other] ? [...ReverseArr<Other>, One] : Arr
type ReverseArrRes = ReverseArr<[1, 2, 3]>

// 数组是否包含某个值
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false)
type Includes<Arr extends unknown[], FindItem> = 
    Arr extends [infer First, ...infer Last]
        ? IsEqual<First, FindItem> extends true 
            ? true 
            : Includes<Last, FindItem>
        : false
type IncludesRes = Includes<[1, 2, 3, 4], 1>

// 删除某个元素
type RemoveItem<Arr extends unknown[], Item, Result extends unknown[] = []>
    = Arr extends [infer First, ...infer Rest]
        ? IsEqual<First, Item> extends true 
            ? RemoveItem<Rest, Item, Result>
            : RemoveItem<Rest, Item, [...Result, First]>
        : Result
type RemoveItemResult = RemoveItem<[1, 2, 3, 4, 2], 2>

// 构造指定类型数组
type BuildArray<Length extends number, Ele = unknown, Arr extends unknown[] = []>
    = Arr['length'] extends Length ? Arr : BuildArray<Length, Ele, [...Arr, Ele]>
type BuildArrResult = BuildArray<5, string>
```

### 字符串

```js
// 替换字符
type ReplaceAll<Str extends string, From extends string, To extends string>
    = Str extends `${infer Prefix}${From}${infer Suffix}`
        ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}` : Str;
type replaceRes = ReplaceAll<'dong dong dong', 'dong', 'xu'>

// 字符串转为联合类型
type StringToUnion<Str extends string> =
    Str extends `${infer One}${infer Other}` ? One | StringToUnion<Other> : never
type StringToUnionRes = StringToUnion<'hello world'>

type ReverseStr<Str extends string, Result extends string = ''> =
    Str extends `${infer First}${infer Last}` ? `${ReverseStr<Last, `${First}${Result}`>}${First}` : Result;

type ReverseStrRes = ReverseStr<'abcdefg'>;

type ToReadonly<T> = {
    readonly [Key in keyof T]: T[Key]
}

type ReadonlyResult = ToReadonly<{
    name: string;
    age: number
}>
```

### 对象

深层readonly，这个直接递归出来的结果不对，要加`Obj extends any`来触发计算，这样才能每个属性都加上readonly。

```js
// 需要加上Obj extends any触发计算才会在每个属性前面加上readonly
type DeepReadonly<Obj extends Record<string, any>> = 
    Obj extends any ? {
        readonly [Key in keyof Obj]: 
            Obj[Key] extends Record<string, any> ? DeepReadonly<Obj[Key]> : Obj[Key]
    } : never

type obj = {
    a: {
        b: {
            c: {
                f: () => 'dong',
                d: {
                    e: {
                        guang: string
                    }
                }
            }
        }
    }
}

type DeepReadonlyRes = DeepReadonly<obj>;
```
## 4. 数组长度做计数

太geek了，不明白这个的作用，不想写，暂时略过。。。

## 5. 联合分散可简化

当类型参数为联合类型，并且在条件类型左边直接引用该类型参数的时候，ts会把每个元素单独传入来做类型运算，最后再合并为联合类型，这种语法叫做分布式条件类型。

啥意思呢，看demo

```js
type Union = 'a' | 'b' | 'c';

type UppercaseA<Item extends string> =
    Item extends 'a' ? Uppercase<Item> : Item;

type result = UppercaseA<Union>; // type result = "b" | "c" | "A"

// 联合类型遇到字符串也会单独每个元素传入处理
type str = `${Union}~~` // type str = "a~~" | "b~~" | "c~~"

```

把联合类型的每一个元素单独传入做计算，然后将最后结果合并。


之前对字符串_后的字符变为大写，如果是联合类型，则直接可以用，会将每一项单独处理。而如果参数是数组的话，就需要取出每一项单独处理了。

```js
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}` : Str
type CamelCaseRes = CamelCase<'a_na_ya' | 'bb_bb_bb' | 'cc_cc_cc'>

```

联合类型的判断，奇奇怪怪的判断，这个就需要单独记住了：

1. A extends A 这种写法是为了触发分布式条件类型，让每个类型单独传入处理
2. A extends A 和 [A] extends [A] 是不同的处理，前者是单个类型和整个类型做判断，后者是两边都是整个联合类型，因为只有extends左边直接是类型参数才会触发分布式条件类型。

```js
type isUnion<A, B = A> = 
    A extends A ? [B] extends [A]
        ? false
        : true
    : never
```

数组转联合类型写法:

```js
type union = ['aaa', 'bbb'][number]
```

css类名bem生成：

```js
type BEM<Block extends string, Element extends string[], Modifiers extends string[]>
    = `${Block}__${Element[number]}--${Modifiers[number]}`;

type bemResult = BEM<'guang', ['aaa', 'bbb'], ['warning', 'success']>
```

返回所有组合类型

```js
type Combination<A extends string, B extends string> = 
 | A
 | B
 | `${A}${B}`
 | `${B}${A}`

type AllCombinations<A extends string, B extends string = A> =
    A extends A ? Combination<A, AllCombinations<Exclude<B, A>>> : never;
```

## 6. 特殊属性要记牢

这部分有的不太明白。首先是特殊类型的判断：

```js
// any 类型与任何类型的交叉都是 any，也就是 1 & any 结果是 any，可以用这个特性判断 any 类型
type isAny<T> = 'xu' extends 'lin' & T ? true : false
type isAnyRes = isAny<any>

type isEqual2<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false

type isEqual2Res = isEqual2<'1', any>

// 是否是联合类型
type isUnion<A, B = A> = A extends A
    ? [A] extends [B] ? false : true
    : false
type isUnionRes = isUnion<'a' | 'b'>

// 如果条件类型左边是类型参数，并且传入的是 never，那么直接返回 never
type TestNever<T> = [T] extends [number] ? true : false;
type testNeverRes = TestNever<never>

// 元祖类型的length是数字字面量，数组的length是number
type len = [1, 2, 3]['length']
type len2 = number[]['length']

type NotEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? false : true;
// 根据length类型判断是否是元组
type isTuple<T> = T extends [...params: infer Eles]
    ? NotEqual<Eles['length'], number>
    : false
type isTupleRes = isTuple<[1, 2, '3']>
```

各种转，特殊属性
```js
// 交叉转联合类型
type UnionToIntersection<U> = 
    (U extends U ? (x: U) => unknown : never) extends (x: infer R) => unknown
        ? R
        : never
type UnionToIntersectionRes = UnionToIntersection<{a: 1} | {b: 1}>

// 利用 可选索引的值为 undefined 和值类型的联合类型。
type GetOptional<Obj extends Record<string, any> > = {
    [Key in keyof Obj as {} extends Pick<Obj, Key> ? Key : never ]: Obj[Key]
}

type GetOptionalRes = GetOptional<{
    a: 1,
    b?: 2
}>

type GetRequired<Obj extends Record<string, any> > = {
    [Key in keyof Obj as {} extends Pick<Obj, Key> ? never : Key]: Obj[Key]
}
type GetRequiredRes = GetRequired<{
    a: 1,
    b?: 2
}>

// 移除索引类型，索引签名不能构造成字符串字面量类型，因为它没有名字，而其他索引可以。
type RemoveIndexSignature<Obj extends Record<string, any> > = {
    [Key in keyof Obj 
        as Key extends `${infer Str}` ? Str : never]: Obj[Key]
}
type RemoveIndexSignatureRes = RemoveIndexSignature<{a: 1, b?: 2, [key: string]: any}>

// 过滤class的公共类型
class Dong {
    public name: string;
    protected age: number;
    private hobbies: string[];
  
    constructor() {
      this.name = 'dong';
      this.age = 20;
      this.hobbies = ['sleep', 'eat'];
    }
  }
// keyof 只能拿到 class 的 public 索引，private 和 protected 的索引会被忽略。
type ClassPublicProps<Obj extends Record<string, any> > = {
    [Key in keyof Obj]: Obj[Key]
}
type ClassPublicPropsRes = ClassPublicProps<Dong>

const obj = {
    a: 1,
    b: 2
} as const
```

这部分特殊属性包含，这可太多了，我是记不住===

-   any 类型与任何类型的交叉都是 any，也就是 1 & any 结果是 any，可以用这个特性判断 any 类型。
-   联合类型作为类型参数出现在条件类型左侧时，会分散成单个类型传入，最后合并。
-   never 作为类型参数出现在条件类型左侧时，会直接返回 never。
-   any 作为类型参数出现在条件类型左侧时，会直接返回 trueType 和 falseType 的联合类型。
-   元组类型也是数组类型，但 length 是数字字面量，而数组的 length 是 number。可以用来判断元组类型。
-   函数参数处会发生逆变，可以用来实现联合类型转交叉类型。
-   可选索引的索引可能没有，那 Pick 出来的就可能是 {}，可以用来过滤可选索引，反过来也可以过滤非可选索引。
-   索引类型的索引为字符串字面量类型，而可索引签名不是，可以用这个特性过滤掉可索引签名。
-   keyof 只能拿到 class 的 public 的索引，可以用来过滤出 public 的属性。
-   默认推导出来的不是字面量类型，加上 as const 可以推导出字面量类型，但带有 readonly 修饰，这样模式匹配的时候也得加上 readonly 才行。

# 四、内置高级类型

这部分感觉最重要，即使上面的不掌握，这部分是要掌握的，也是可能出现在面试题里的。下面写常见的高级ts类型。

下面主要是通过infer提取参数：

```js
// 提取parameters
type myParameters<T extends (...args: any) => any> = 
    T extends (...args: infer Args) => any ? Args : never

type ParametersRes = myParameters<(name: string, age: number) => {}>;

// 提取函数返回值

type myReturnType<T extends (...args: any) => any> = 
    T extends (...args: any) => infer R ? R : never;

type ReturnRes = myReturnType<(name: string, age: number) => {}>;

// 提取构造函数的参数值
type myConstructorParameters<T extends new (...args: any) => any> =
    T extends new (...args: infer Args) => any ? Args : never

interface PersonConstructor {
    new(name: string): Person
}

type myConstructorParametersRes = myConstructorParameters<PersonConstructor>

// 提取构造函数的instanceType，就是构造函数的返回值
type myInstanceType<T extends new (...args: any) => any> =
    T extends new (...args) => infer R ? R : never
type myInstanceTypeRes = myInstanceType<PersonConstructor>
```

接下来类型变换的，这部分估计用的最多，考的也最多，**敲重点了**！！！：

```js
// 变可选
type myPartial<T> = {
    [P in keyof T]?: T[P]
}
type PartialRes = Partial<{name: 'dong', age: 18}>

type myRequired<T> = {
    [P in keyof T]-?: T[P]
}

type myReadonly<T> = {
    readonly [P in keyof T]: T[P]
}

type myPick<T, K extends keyof T> = {
    [P in K]: T[P]
}

type PickRes = Pick<{name: 'dong', age: 18, sex: 1}, 'name' | 'age'>

type myRecord<K extends keyof any, T> = {
    [P in K]: T
}

type RecordRes = Record<'a' | 'b', number>

type myExclude<T, U> = T extends U ? never : T;

type myExcludeRes = myExclude<'1'|'2'|'3', '1' | '2'>

type myExtract<T, U> = T extends U ? T : never;

type myExtractRes = myExtract<'1'|'2'|'3', '1' | '2'>

type myOmit<T, K extends keyof T> = {
    [P in Exclude<keyof T, K>]: T[P]
}

type myOmitRes = myOmit<{name: 'dong', age: 18, sex: 1}, 'name' | 'age'>

type Awaited<T> =
    T extends null | undefined
        ? T 
        : T extends object & { then(onfulfilled: infer F): any }
            ? F extends ((value: infer V, ...args: any) => any)
                ? Awaited<V>
                : never 
            : T;

type myAwaited<T> = 
    T extends null | undefined
        ? T
        : T extends object & { then(onfulfilled: infer F): any}
            ? F extends ((value: infer V, ...args: any) => any)
                ? Awaited<V>
                : never;

type myNonNullable<T> = T extends undefined | null ? never : T;
type myNonNullableRes = myNonNullable<string>
```

# 五、资料

哈哈，下面是bing的回答：


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da47c76870974df08b6a8ce078a26360~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1510&h=796&s=514801&e=png&b=f9f8fa)

给出的资料还是挺不错的：

-   [TypeScript 类型体操姿势合集<通关总结>–刷完](https://juejin.cn/post/6999280101556748295)：这篇文章介绍了一些常见的ts类型体操的题目和解法，以及一些姿势总结。
-   [TypeScript类型体操训练（一）](https://juejin.cn/post/7077464587313872932)：这篇文章是一个系列的第一部分，介绍了如何使用Type Challenges仓库来进行ts类型体操的训练。
-   [为什么 TypeScript 会有「类型体操」？](https://www.zhihu.com/question/528403706)：这篇文章解释了ts类型体操的原理和意义，以及它和值空间编程的区别。
-   [GitHub - qc-z/type-challenges: typescript 类型体操](https://github.com/qc-z/type-challenges)：这是一个GitHub仓库，收集了一些ts类型体操的题目和解答，你可以fork或者clone来自己尝试。

我再加一个：

[TS 类型挑战通关手册](https://blog.maxiaobo.com.cn/type-challenge/dist/)

总算写的差不多了，学习ts的过程并不快乐，不是舒适区，几度不想写，不想看，但总算写完了，接下来几天不想看ts了。。。😓
