const Apollo = {
    version: "20250929",
    empty: 'hiker://empty',
    url: "https://javfinder.ai",
    d: [],
    getRangeColors: function() {
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0)
                .toString(16))
            .substr(-6);
    }, //随机颜色
    pageAdd: function(page) {
        if (getMyVar("page")) {
            putMyVar("page", (parseInt(page) + 1) + '');
        }
        return;
    }, //翻页
    pageMoveto: function(page, pages) {
        var longClick = [{
            title: "首页",
            js: $.toString(() => {
                putMyVar("page", "1");
                refreshPage();
                return "hiker://empty";
            }),
        }, {
            title: "上页",
            js: $.toString((page) => {
                if (page > 1) {
                    putMyVar("page", (parseInt(page) - 1));
                    refreshPage();
                    return "hiker://empty";
                }
            }, page),
        }, {
            title: "第" + page + "页",
            js: "",
        }, {
            title: "跳转",
            js: $.toString(() => {
                return $("").input(() => {
                    putMyVar("page", input);
                    refreshPage();
                });
            }),
        }];
        if (typeof(pages) != 'undefined') {
            var extra1 = {
                title: "尾页" + pages,
                js: $.toString((pages) => {
                    putMyVar("page", pages);
                    refreshPage();
                    return "hiker://empty";
                }, pages),
            };
            longClick.push(extra1)
        }
        return longClick
    }, //长按跳页
    data: {
        category: getMyVar('Apollo.category', '0'),
        subCate: getMyVar('Apollo.subCate', '0'),
    },
    baseParse: () => {
        putMyVar("MY_TYPE", "主页");
        var page = getMyVar("page", MY_PAGE + "")
        let categoryList = [{
            "title": "Home",
            "path": "/home/",
            "type": "home",
            "sub": []
        }, {
            "title": "Popular",
            "path": "/movies/hot",
            "type": "video",
            "sub": []
        }, {
            "title": "UnMosaic",
            "path": "/category/reducing-mosaic",
            "type": "video",
            "sub": []
        }, {
            "title": "Censored",
            "path": "/category/censored-jav",
            "type": "video",
            "sub": []
        }, {
            "title": "Uncensored",
            "path": "/category/uncensored-jav",
            "type": "video",
            "sub": []
        }, {
            "title": "Amateur",
            "path": "/category/amateur",
            "type": "video",
            "sub": []
        }, {
            "title": "Chinese Sub",
            "path": "/category/chinese-subtitles",
            "type": "video",
            "sub": []
        }, {
            "title": "English Sub",
            "path": "/category/english-subtitles",
            "type": "video",
            "sub": []
        }, {
            "title": "Tag Filter",
            "path": "",
            "type": "avatar",
            "sub": [{
                "title": "Maker",
                "path": "/studios"
            }, {
                "title": "Cast",
                "path": "/cast"
            }, {
                "title": "Genre",
                "path": "/tags"
            }]
        }]
        const currentCate = categoryList[Apollo.data.category]
        let url
        var type = currentCate.type
        var path = currentCate.path
        if (currentCate.sub.length > 0) {
            url = getMyVar("url", Apollo.url + currentCate.sub[Apollo.data.subCate].path)
        } else {
            url = getMyVar("url", Apollo.url + currentCate.path)
        }

        if (type != "home") {
            url = url.replace(/(\/page-.*|$)/, (match) => {
                if (match.startsWith('/page') || match.startsWith('&')) {
                    return "/page-" + page
                } else {
                    return "/page-" + page
                }
            });
        } else {
            url = url
        }
        Apollo.pageAdd(page)
        if (url.includes("search")) {
            type = "search"
        }

        if (MY_PAGE == 1) {
            categoryList.forEach((cate, index) => {
                Apollo.d.push({
                    title: parseInt(Apollo.data.category) === index ?
                        '‘‘’’' + cate.title.fontcolor("#FFFFFF") : cate.title,
                    url: $(Apollo.empty + "#noLoading#").lazyRule((index) => {
                        putMyVar("Apollo.category", index.toString())
                        putMyVar("Apollo.subCate", '0')
                        clearMyVar("url")
                        clearMyVar("page")
                        clearMyVar("sort")
                        clearMyVar("ysort")
                        refreshPage(true)
                        return "hiker://empty"
                    }, index),
                    extra: {
                        'backgroundColor': parseInt(Apollo.data.category) === index ? Apollo.getRangeColors() : ''
                    },
                    col_type: 'scroll_button',
                })
            })
            if (currentCate.sub.length > 0) {
                Apollo.d.push({
                    col_type: 'blank_block',
                })
                currentCate.sub.forEach((cate, index) => {
                    Apollo.d.push({
                        title: parseInt(Apollo.data.subCate) === index ?
                            '‘‘’’' + cate.title.fontcolor("#FFFFFF") : cate.title,
                        url: $(Apollo.empty + "#noLoading#").lazyRule((index) => {
                            putMyVar("Apollo.subCate", index.toString());
                            clearMyVar("url")
                            clearMyVar("page")
                            clearMyVar("sort")
                            clearMyVar("ysort")
                            refreshPage(true)
                            return "hiker://empty"
                        }, index),
                        extra: {
                            'backgroundColor': parseInt(Apollo.data.subCate) === index ? Apollo.getRangeColors() : ''
                        },
                        col_type: 'scroll_button',
                    })
                })
            }
        }
        var html = fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)'
            },

        })
        log(url)

        //动态分类
        Apollo.DynamicSort(html)

        //搜索
        if (MY_PAGE == 1) {
            Apollo.d.push({
                title: "🔍",
                url: $.toString((url, page) => {
                    if (input.trim() != "") {
                        putMyVar('keyword', input);
                        var searchUrl = getHome(url) + "/search/movie/" + input + "/page-1"
                        putMyVar("url", searchUrl);
                        refreshPage();
                        return "hiker://empty"
                    } else {
                        return "confirm://搜索内容为空.js:'hiker://empty'"
                    }
                }, url, page),
                desc: '搜索...',
                col_type: "input",
                extra: {
                    defaultValue: getMyVar('keyword', '') || "",
                }
            });
        }

        switch (type) {
            case 'home':
                if (MY_PAGE == 1 && !/search/.test(url)) {
                    /*try {
                        Apollo.lunboType(html)
                    } catch {}*/
                    Apollo.homeType(html)
                    //Apollo.videoType(html, page)
                }
                break
            case 'video':
                Apollo.videoType(html, page)
                break
            case 'avatar':
                Apollo.avatarType(html, page)
                break
            case 'search':
                if (MY_PAGE == 1) {
                    Apollo.d.push({
                        title: '““””' + "搜寻结果".fontcolor("#FF00FF"),
                        url: "hiker://empty",
                        col_type: "text_1",
                        extra: {
                            lineVisible: false
                        }
                    })
                    Apollo.d.push({
                        col_type: "blank_block"
                    })
                }
                Apollo.videoType(html, page)
                break
            default:
                Apollo.videoType(html, page)
        }
        setResult(Apollo.d)
    },

    //动态分类
    DynamicSort: (html) => {
        const 分类颜色 = Apollo.getRangeColors()
        const 大类定位 = ".filters-select&&.filters-options"
        const 拼接分类 = ""
        const 小类定位 = "body&&a"
        const 分类标题 = "Text"
        const 分类链接 = "a&&href"
        Apollo.d.push({
            col_type: "blank_block"
        });
        try {
            if (typeof(拼接分类) != 'undefined' && 拼接分类 != '') {
                var categories = pdfa(html, 大类定位).concat(pdfa(html, 拼接分类))
            } else {
                var categories = pdfa(html, 大类定位)
            }
        } catch {
            var categories = pdfa(html, 大类定位)
        }
        let init_cate = []
        for (let i = 0; i < 20; i++) {
            init_cate.push("0")
        }
        if (getMyVar("MY_TYPE") == "主页") {
            var cate_temp_json = getMyVar("sort", JSON.stringify(init_cate))
        } else {
            var cate_temp_json = getMyVar("ysort", JSON.stringify(init_cate))
        }
        var cate_temp = JSON.parse(cate_temp_json)

        if (MY_PAGE == 1) {
            categories.forEach((category, index) => {
                let sub_categories = pdfa(category, 小类定位);
                sub_categories.forEach((item, key) => {
                    let title = pdfh(item, 分类标题)
                    if (typeof(排除) != 'undefined' && 排除 != '') {
                        title = title.replace(new RegExp(排除, "g"), "")
                    };
                    Apollo.d.push({
                        title: key.toString() === cate_temp[index] ? '““””' + title.fontcolor(分类颜色) : title,
                        url: $(pd(item, 分类链接) + '#noLoading#').lazyRule((params) => {
                            params.cate_temp[params.index] = params.key.toString()
                            if (getMyVar("MY_TYPE") == "主页") {
                                putMyVar('sort', JSON.stringify(params.cate_temp));
                                putMyVar("url", input);
                            } else {
                                putMyVar('ysort', JSON.stringify(params.cate_temp));
                                putMyVar("yurl", input);
                            }
                            clearMyVar("page")
                            refreshPage(true)
                            return "hiker://empty"
                        }, {
                            cate_temp: cate_temp,
                            index: index,
                            key: key,
                            page: MY_PAGE,
                        }),
                        col_type: 'scroll_button',
                        extra: {
                            'backgroundColor': key.toString() === cate_temp[index] ? Apollo.getRangeColors() : ''
                        }
                    })
                })
                Apollo.d.push({
                    col_type: "blank_block"
                });
            })
        }
    },

    //搜索
    searchParse: (url) => {
        keyword = url.split("##")[1]
        url = Apollo.url + "/search/movie/" + keyword + "/page-" + MY_PAGE
        log(url)
        var html = fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)'
            },

        })
        Apollo.videoType(html);
        setResult(Apollo.d)
    },
    //视频列表
    videoType: (html, page) => {
        try {
            var pages = pdfh(html, ".pagination&&a[title^=Last]&&href").match(/\/page-(\d+)/)[1]
        } catch (e) {
            var pages = 1
        }
        var list = pdfa(html, "body&&article")
        list.forEach(item => {
            var img = pdfh(item, 'img&&data-src');
            var url = pd(item, 'a&&href');
            var title = pdfh(item, 'img&&alt').replace("[Reducing Mosaic]", "🔥").replace("[Chinese Subtitles]", "🇨🇳").replace("[English Subtitles]", "🇺🇸");
            Apollo.d.push({
                title: title,
                url: url + $('#noHistory#').rule((t) => {
                    const Apollo = $.require('hiker://page/Apollo?rule=' + t)
                    Apollo.videoParse(MY_URL)
                    setResult(Apollo.d)
                }, MY_RULE.title),
                pic_url: img,
                desc: "⏰" + pdfh(item, '.duration&&Text'),
                col_type: 'movie_2',
                extra: {
                    img: img,
                    longClick: page ? Apollo.pageMoveto(page, pages) : ""
                }
            })
        })
    },
    //二级
    videoParse: (url) => {
        var html = fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)'
            },

        });
        log(url)
        const title = pdfh(html, 'h1&&Text')

        setPageTitle(title)

        Apollo.d.push({
            title: '““””<small><font color=#e57a1a>' + title + '</font></small>',
            url: "hiker://empty" + $('#noLoading#').lazyRule((title) => {
                title = title.replace(/FC2PPV\s\d+/, "").replace(/\w+-\d+\s/, "")
                //动态刷新
                var desc = findItem('transdesc').desc
                if (!desc) {
                    const Apollo = $.require('hiker://page/Apollo')
                    var translates = Apollo.translate(title)
                    updateItem("transdesc", {
                        desc: '““””' + translates.fontcolor("red").small(),
                    })
                } else {
                    updateItem("transdesc", {
                        desc: '',
                    })
                }
                return "hiker://empty"
                /*       
                          var translates = $.require("trans").translate(title)   
                          return "confirm://" + translates + ".js:'hiker://empty' "   */
            }, title),
            col_type: 'text_1',
            extra: {
                lineVisible: false,
                id: 'transdesc',
                longClick: [{
                    title: '网页',
                    js: $.toString(() => {
                        return "web://" + MY_URL
                    })
                }, {
                    title: '复制',
                    js: $.toString((title) => {
                        return "copy://" + title;
                    }, title)
                }, {
                    title: '百度翻译',
                    js: $.toString((title) => {
                        return "x5://https://fanyi.baidu.com/#en/zh/" + title
                    }, title)
                }, {
                    title: 'Deepl翻译',
                    js: $.toString((title) => {
                        return "x5://https://www.deepl.com/zh/translator-mobile#en/zh/" + title
                    }, title)
                }, {
                    title: '谷歌翻译',
                    js: $.toString((title) => {
                        return "x5://https://translate.google.com/?hl=zh-CN&sl=en&tl=zh-CN&text=" + title
                    }, title)
                }]
            }
        })
        var src = "https://javfinder.ai/stream/" + html.match(/iframe src.*?"(.*?)"/)[1].split("#")[1];
        Apollo.d.push({
            pic_url: MY_PARAMS.img, //pdfh(html, '.object-fit-contain&&poster') + '@Referer=' + Apollo.url,
            url: src + $("").lazyRule(() => {
                try {
                    var location = JSON.parse(fetch(input)).list[0].url;
                    var master = fetchCodeByWebView(location, {
                        headers: {
                            Referer: "https://javfinder.ai/"
                        }
                    });
                    var script = master.match(/eval([\s\S]+?)<\/script/)[1];
                    //log(script)
                    var uas = eval(script)
                    var link = uas.match(/var links[^\;]+/)[0];
                    //log(link)
                    eval(link)
                    var jwplayer = "https://xenolyzb.com" + links.hls4//uas.match(/"(https?.*m3u8.*?)"/)[1]
                    //log(jwplayer)
                    return jwplayer + ";{Referer@" + getHome(location) + "/}"
                } catch {
                    return "toast://网络出错请重试"
                }
            }),
            col_type: 'pic_1_full',
        })

        //信息
        var tabs = pdfa(html, "body&&#video-about>div:has(i)")
        tabs.forEach((tag, index) => {
            let list = pdfa(tag, "body&&a")
            var line = pdfh(tag, "Text")
            line = /Date/.test(line) ? line : line.replace(/(.*:|^).*/, "$1");
            if (line != "") {
                Apollo.d.push({
                    title: line,
                    url: "hiker://empty",
                    col_type: /Date/.test(line) ? "rich_text" : "flex_button",
                    extra: {
                        lineVisible: false
                    }
                })
            }
            list.forEach((item, indexx) => {
                let url = pd(item, "a&&href") + "/page-fypage"
                let title = pdfh(item, "a&&Text");
                Apollo.d.push({
                    title: title,
                    img: pdfh(item, "img&&src"),
                    url: url + $('#noHistory#').rule((t) => {
                        const Apollo = $.require('hiker://page/Apollo?rule=' + t)
                        Apollo.yijiParse(MY_URL)
                        setResult(Apollo.d)
                    }, MY_RULE.title),
                    col_type: line.indexOf("Actress") != -1 ? "card_pic_3" : "flex_button",
                    extra: {
                        'backgroundColor': Apollo.getRangeColors(),
                        pageTitle: title
                    }
                })
            })
            Apollo.d.push({
                col_type: "blank_block"
            })
        })
        Apollo.d.push({
            title: '推荐视频',
            url: Apollo.empty,
            col_type: 'text_center_1',
            extra: {
                lineVisible: false
            },
        })

        Apollo.videoType(html)
        Apollo.d.push({
            title: '““””' + "我是有底线的".fontcolor("grey")
                .small(),
            url: Apollo.empty,
            col_type: "text_center_1",
            extra: {
                lineVisible: false
            }
        })
        setResult(Apollo.d)
    },

    //一级.简
    yijiParse: (url) => {
        putMyVar("MY_TYPE", "一级")
        var page = getMyVar("page", MY_PAGE + "")
        try {
            var pages = pdfh(html, ".pagination&&a[title^=Last]&&href").match(/\/page-(\d+)/)[1]
        } catch (e) {
            var pages = 1
        }
        addListener("onClose", $.toString(() => {
            clearMyVar("yurl");
            clearMyVar("ysort");
            clearMyVar("page")
        }));
        url = getMyVar("yurl", url)
        url = url.replace(/(\/page-.*|$)/, (match) => {
            if (match.startsWith('/page') || match.startsWith('&')) {
                return "/page-" + page
            } else {
                return "/page-" + page
            }
        });
        log(url)
        Apollo.pageAdd(page)
        var html = fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)'
            },
        })

        Apollo.DynamicSort(html)
        Apollo.videoType(html, page)
    },

    avatarType: (html, page) => {
        try {
            var pages = pdfh(html, ".pagination&&a[title^=Last]&&href").match(/\/page-(\d+)/)[1]
        } catch (e) {
            var pages = 1
        }
        const list = pdfa(html, ".videos-list&&article")
        list.forEach(item => {
            //var img = pdfh(item, 'img&&src');
            Apollo.d.push({
                title: pdfh(item, 'a&&Text'),
                //img: img,
                url: $(pd(item, 'a&&href') + '/page-fypage#noHistory#').rule((t) => {
                    const Apollo = $.require('hiker://page/Apollo?rule=' + t)
                    Apollo.yijiParse(MY_URL)
                    setResult(Apollo.d)
                }, MY_RULE.title),
                col_type: "text_1",
                extra: page ? {
                    longClick: Apollo.pageMoveto(page)
                } : ""
            })
        })
    },

    //首页轮播
    lunboType: (html) => {
        //轮播Html
        let getHtml = (image) => `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>轮播图</title>
    <style>
        .carousel-container {
    width: calc(100% - 10px);
    margin: 0 auto;
    position: relative;
    overflow: hidden; /* 确保溢出部分被隐藏 */
    border-radius: 10px;    
}

.carousel {
    display: flex;
    transition: transform 0.5s ease-in-out;
}

.carousel img {
    width: 100%;
    aspect-ratio: 1.8; /height: 45vw* 自动调整高度以保持宽高比 */
    object-fit: cover;
    border-radius: 10px; /* 确保图片和容器边角一致 */
    display: block; /* 确保没有额外的间隙 */
}

.carousel-item {
    flex: 0 0 100%; /* 确保轮播项宽度为容器宽度 */
    box-sizing: border-box; /* 确保内边距和边框计算在内 */
}

.carousel-buttons {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.carousel-button {
    background-color: rgba(0, 0, 0, 0.05);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 50px;
}

.carousel-indicators {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
}

.carousel-indicator {
    width: 10px;
    height: 4px;
    background-color: #808080; /* 灰色 */
    margin: 0 2px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.carousel-indicator.active {
    background-color: #00FF00; /* 绿色 */
}

.carousel-title {
    position: absolute;
    top: 10px;
    left: 10px;
    color: white;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8));
    padding: 5px 10px;
    border-radius: 50px;
    font-weight: bold;
}

.carousel-caption h5 {
    font-family: 'Arial', sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
    padding: 5px 10px;
    border-radius: 10px;
}

.carousel-caption p {
    font-family: 'Georgia', serif;
    font-size: 18px;
    font-weight: bold;
    color: #cccccc;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
    padding: 5px 10px;
    border-radius: 10px;
}
    </style>
</head>
<body>
    <div class="carousel-container">
        <div class="carousel" id="carousel" data-images='${JSON.stringify(image)}'>
            <!-- 这里将通过JavaScript动态插入图片 -->
        </div>
        <div class="carousel-buttons">
            <button class="carousel-button" id="prevBtn">〈</button>
            <button class="carousel-button" id="nextBtn">〉</button>
        </div>
        <div class="carousel-indicators" id="carouselIndicators">
            <!-- 这里将通过JavaScript动态插入指示器 -->
        </div>
        <div class="carousel-title" id="carouselTitle">标题</div>
    </div>

</body>
</html>
`;
        //轮播函数
        function lunbo(d, image, sui) {
            let Html = getHtml(image);
            let path = getPath("hiker://files/_cache/fylunbo.html");
            writeFile(path, '<!DOCTYPE html><html lang="zh"><body></body></html>');
            let px = fetch('hiker://files/cache/lunboWindh.txt') || "188";
            d.push({
                col_type: "x5_webview_single",
                url: path + "#a=" + sui,
                desc: "list&&" + px,
                extra: {
                    js: $.toString((Html) => {
                        // 监听窗口大小变化
                        window.addEventListener('resize', function() {
                            // 获取当前窗口的宽度
                            var screenWidth = window.innerWidth;
                            // 计算窗口宽度的49%
                            var percentageWidth = Math.round(screenWidth * 0.56);
                            let path = "hiker://files/cache/lunboWindh.txt";
                            fba.writeFile(path, percentageWidth);
                        });
                        document.documentElement.innerHTML = Html;

                        let currentIndex = 0;
                        let carouselInterval;

                        const carousel = document.getElementById('carousel');
                        const carouselIndicators = document.getElementById('carouselIndicators');
                        const carouselTitle = document.getElementById('carouselTitle');
                        let images = JSON.parse(carousel.dataset.images); // 获取初始图片数据

                        function updateCarousel() {
                            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                            carouselTitle.textContent = images[currentIndex].title;
                            document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
                                indicator.classList.toggle('active', index === currentIndex);
                            });
                        }

                        function createCarousel() {
                            carousel.innerHTML = '';
                            carouselIndicators.innerHTML = '';

                            images.forEach((image, index) => {
                                const imgElement = document.createElement('a');
                                imgElement.href = `${image.link}#${image.src}#${image.title}#${image.sode}`;
                                imgElement.classList.add('carousel-item');
                                imgElement.innerHTML = `<img src="${decodeURIComponent(image.src)}" alt="${image.title}">`;
                                carousel.appendChild(imgElement);

                                const indicator = document.createElement('div');
                                indicator.classList.add('carousel-indicator');
                                indicator.addEventListener('click', () => {
                                    currentIndex = index;
                                    updateCarousel();
                                    resetCarouselInterval();
                                });
                                carouselIndicators.appendChild(indicator);
                            });

                            if (currentIndex >= images.length) {
                                currentIndex = 0;
                            }
                            updateCarousel();
                            startCarouselInterval();
                        }

                        function startCarouselInterval() {
                            carouselInterval = setInterval(() => {
                                currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
                                updateCarousel();
                            }, 3333); // 设置自动轮播时间为3秒
                        }

                        function resetCarouselInterval() {
                            clearInterval(carouselInterval);
                            startCarouselInterval();
                        }

                        document.getElementById('prevBtn').addEventListener('click', () => {
                            currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
                            updateCarousel();
                            resetCarouselInterval();
                        });

                        document.getElementById('nextBtn').addEventListener('click', () => {
                            currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
                            updateCarousel();
                            resetCarouselInterval();
                        });

                        // 初始化轮播图
                        createCarousel();

                    }, Html),
                    urlInterceptor: $.toString((game, sui, myurle) => {
                        return $.toString((game, sui, myurle, input) => {
                            let pat = input.split("#");
                            let title = decodeURIComponent(pat[2]);
                            let url = `hiker://empty##${pat[0]}#noHistory##autoCache${game}`;
                            let findRule = "js:" + $$$.toString((url, myurle) => {
                                url = url.replace("hiker://empty##", "")
                                eval(fetch('hiker://files/rules/Apollo/' + myurle + '.js'))
                                Apollo.videoParse(url)
                            }, url, myurle);
                            let img = `${pat[1]}@Referer=`;
                            let desc = decodeURIComponent(pat[3]);
                            fba.open(JSON.stringify({
                                rule: myurle,
                                title: `${title}「${sui}」`,
                                url: url,
                                findRule: findRule,
                                extra: {
                                    title: title,
                                    desc: desc,
                                    img: img,
                                    inheritTitle: false,
                                    pageTitle: `${title}「${sui}」`
                                }
                            }));
                        }, game, sui, myurle, input);
                    }, game, sui, MY_RULE.title),
                    //cls: "cls_fylunbo",
                    ua: MOBILE_UA,
                    //imgLongClick: false
                }
            });
        };
        let lundata = [];
        // 假设传入的图片数据
        lundata = pdfa(html, "#top-carousel&&.box-item").map(item => {
            return {
                title: pdfh(item, ".name&&Text"),
                src: pdfh(item, "img&&src").replace("resize/s500", "images").replace("@Referer=", ""),
                sode: "",
                link: Apollo.url + pdfh(item, "a&&href")
            };
        });
        let game = "#"; //"##gameTheme##immersiveTheme#" 二级模式
        lunbo(Apollo.d, lundata, "𝟏𝟐𝟑𝐀𝐕");
    },

    //首页
    homeType: (html) => {
        var 线路 = '#main&&section';
        var 线路名 = 'h2&&Text.js:input.replace("JavFinder ","").replace("Jav","")';
        var 选集 = '#main&&section';
        var 选集列表 = 'body&&article';
        var 标题 = 'a&&title.js:input.replace("[Reducing Mosaic]","🔥").replace("[Chinese Subtitles]","🇨🇳").replace("[English Subtitles]","🇺🇸")';
        var 描述 = '.duration&&Text';
        var 预览 = '.video-preview&&data-mediabook';
        var 图片 = 'img&&data-src';
        var 链接 = 'a&&href';
        var 样式 = 'movie_2';
        var tabs = []
        var lists = []
        var lazy
        pdfa(html, 线路).forEach(data => {
            data = pdfh(data, 线路名)
            if (typeof(排除) != 'undefined' && 排除 != '') {
                data = data.replace(new RegExp(排除, "g"), "")
            }
            tabs.push(data)
        })
        pdfa(html, 选集).forEach(data => {
            lists.push(pdfa(data, 选集列表))
        })
        addListener("onClose", $.toString(() => {
            clearMyVar("lists");
        }));
        storage0.putMyVar("lists", lists);
        var list = lists[getMyVar("𝐀𝐩𝐨𝐥𝐥𝐨", '0')];
        tabs.forEach((data, id) => {
            Apollo.d.push({
                title: getMyVar("𝐀𝐩𝐨𝐥𝐥𝐨", '0') == id ? '““' + data + '””' : data,
                url: $("#noLoading#").lazyRule((线路, lazy, id, 标题, 描述, 预览, 图片, 链接, 样式) => {
                    var lists = storage0.getMyVar("lists");
                    线路.forEach((data, xlid) => {
                        updateItem({
                            title: id == xlid ? '““' + data + '””' : data,
                            extra: {
                                id: "𝐀𝐩𝐨𝐥𝐥𝐨" + "_线路" + xlid
                            }
                        });
                    });
                    putMyVar("𝐀𝐩𝐨𝐥𝐥𝐨", id)
                    var 章节 = lists[getMyVar("𝐀𝐩𝐨𝐥𝐥𝐨", '0')];
                    let cp = 章节.map((data, ssid) => {
                        var img = pd(data, 图片);
                        //var imgg = pd(data, 预览) + "#isVideo=true#";
                        return {
                            title: pdfh(data, 标题),
                            desc: pdfh(data, 描述),
                            img: img,
                            url: pd(data, 链接) + $('#noHistory#').rule(() => {
                                const Apollo = $.require('hiker://page/Apollo')
                                Apollo.videoParse(MY_URL)
                                setResult(Apollo.d)
                            }),
                            col_type: 样式,
                            extra: {
                                img: img,
                                cls: "𝐀𝐩𝐨𝐥𝐥𝐨" + "_选集",
                                id: pd(data, 链接),
                                /*longClick: [{
                                    title: '打开图片',
                                    js: $.toString((img) => {
                                        return img
                                    }, imgg)
                                }]*/
                            }
                        };
                    });
                    deleteItemByCls("𝐀𝐩𝐨𝐥𝐥𝐨" + "_选集");
                    addItemBefore("𝐀𝐩𝐨𝐥𝐥𝐨" + "footer", cp);
                    return "hiker://empty"
                }, tabs, lazy, id, 标题, 描述, 预览, 图片, 链接, 样式),
                col_type: 'scroll_button',
                extra: {
                    id: "𝐀𝐩𝐨𝐥𝐥𝐨" + "_线路" + id
                }
            });
        })
        list.forEach((data, id) => {
            var img = pd(data, 图片);
            //var imgg = pd(data, 预览) + "#isVideo=true#";
            Apollo.d.push({
                title: pdfh(data, 标题),
                desc: pdfh(data, 描述),
                img: img,
                url: pd(data, 链接) + $('#noHistory#').rule(() => {
                    const Apollo = $.require('hiker://page/Apollo')
                    Apollo.videoParse(MY_URL)
                    setResult(Apollo.d)
                }),
                col_type: 样式,
                extra: {
                    img: img,
                    cls: "𝐀𝐩𝐨𝐥𝐥𝐨" + "_选集",
                    id: pd(data, 链接),
                    /*longClick: [{
                        title: '打开图片',
                        js: $.toString((imgg) => {
                            return imgg
                        }, imgg)
                    }]*/
                }
            });
        })
        /* Apollo.d.push({
             col_type: "big_blank_block",
             extra: {
                 id: "𝐀𝐩𝐨𝐥𝐥𝐨" + "footer"
             }
         });*/
        Apollo.d.push({
            title: '““””' + "我是有底线的".fontcolor("grey")
                .small(),
            url: "hiker://empty",
            col_type: "text_center_1",
            extra: {
                id: "𝐀𝐩𝐨𝐥𝐥𝐨" + "footer",
                lineVisible: false
            }
        })
    },
    //详情
    setDesc: (desc) => {
        function substr(str, maxLength) {
            let len = 0;
            for (let i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255) {
                    len += 2;
                } else {
                    len++;
                }
                if (len > maxLength) {
                    return str.slice(0, i) + '...';
                }
            }
            return str;
        }

        function setDesc(arr, desc, num) {
            //log(desc)
            if (desc == undefined) {
                return;
            }
            desc = desc.constructor == Array ? desc.join('<br>') : desc;
            if (desc.replace(/(<br>|\s+|<\/?p>|&nbsp;)/g, '').length == 0) {
                return;
            }

            const mark = 'desc';
            num = typeof(num) == 'undefined' ? 100 : num
            desc = desc.startsWith('　　') ? desc : '　　' + desc;
            desc = desc.replace(/'/g, "&#39;");
            desc = desc.replace(/\r\n/g, "<br>");
            desc = desc.replace(/\r/g, "<br>");
            desc = desc.replace(/\n/g, "<br>");
            let sdesc = substr(desc, num);

            var colors = {
                show: "#008B8B",
                hide: "#8A2BE2"
            }

            var lazy = $(`#noLoading#`).lazyRule((dc, sdc, m, cs) => {
                var show = storage0.getItem(m, '0');
                var title = findItem('desc').title;
                var re = /(<\/big><br>.*?>).+/g;
                var exp = '展开:';
                var ret = '收起:';
                if (show == '1') {
                    updateItem('desc', {
                        title: title
                            .replace(ret, exp)
                            .replace(re, '$1' + sdc + '</small>')
                            .replace(/(<\/big><br>\<font color=").*?(">)/, '$1' + cs.hide + '$2')

                    })
                    storage0.setItem(m, '0');
                } else {
                    updateItem('desc', {
                        title: title
                            .replace(exp, ret)
                            .replace(re, '$1' + dc + '</small>')
                            .replace(/(<\/big><br>\<font color=").*?(">)/, '$1' + cs.show + '$2')
                    })
                    storage0.setItem(m, '1');
                }
                return `hiker://empty`
            }, desc, sdesc, mark, colors)
            var sc = storage0.getItem(mark, '0') == '0' ? '展开:' : '收起:';
            var dc = storage0.getItem(mark, '0') == '0' ? sdesc : desc;
            var cs = storage0.getItem(mark, '0') == '0' ? colors.hide : colors.show;
            arr.push({
                title: '' + '<b><font color="">∷ 剧情简介	</font></b>' + "<middle><a style='text-decoration: none;' href='" + lazy + "'>" + sc + '</a></big><br><font color="' + cs + '">' + `${dc}` + '</small>',
                col_type: 'rich_text',
                extra: {
                    id: 'desc',
                    lineSpacing: 6,
                    textSize: 15,
                    lineVisible: true,
                }
            })
        }

        setDesc(Apollo.d, desc, 90);
    },

    //翻译
    translate: (text) => {
        var switchtrans = true;
        if (switchtrans == true || switchtrans == "彩云小译") {
            try {
                var to = 'zh'
                var from = 'auto'

                function init_data(source_lang, target_lang) {
                    return {
                        source: '',
                        detect: true,
                        os_type: 'ios',
                        device_id: 'F1F902F7-1780-4C88-848D-71F35D88A602',
                        trans_type: source_lang + '2' + target_lang,
                        media: 'text',
                        request_id: 424238335,
                        user_id: '',
                        dict: true,
                    }
                }

                function getRandomNumber() {
                    const rand = Math.floor(Math.random() * 99999) + 100000
                    return rand * 1000
                }
                const post_data = init_data(from, to)
                post_data.source = text
                post_data.request_id = getRandomNumber()
                let res = fetch('https://interpreter.cyapi.cn/v1/translator', {
                    method: 'POST',
                    header: {
                        'Content-Type': 'application/json',
                        'x-authorization': 'token ssdj273ksdiwi923bsd9',
                        'user-agent': 'caiyunInterpreter/5 CFNetwork/1404.0.5 Darwin/22.3.0',
                    },
                    body: post_data,
                })
                let result = JSON.parse(res)
                    .target
                return result + "【☁️】"
            } catch {
                log("翻译失败，使用原文");
                return text
            }
        } else if (switchtrans == "小牛翻译") {
            try {
                var url = "https://api.niutrans.com/NiuTransServer/translation";
                var api = "ae337b61113bd81db91120dc4ef9b055";
                if (api) {
                    if (text != "") {
                        var lang = "https://test.niutrans.com/NiuTransServer/language?src_text=" + text + "&source=text";
                        var from = JSON.parse(fetch(lang, {
                                timeout: 1000
                            }))
                            .language;
                        var result = post(url, {
                            body: {
                                src_text: text,
                                from: from,
                                to: "zh",
                                apikey: api,
                            },
                            timeout: 1223
                        });
                        var data = JSON.parse(result)
                        if (data.tgt_text) {
                            return data.tgt_text + "【🐮】"
                        } else {
                            log("翻译失败，使用原文");
                            return text
                        }
                    } else {
                        log("翻译失败，原文为空");
                        return text
                    }
                } else {
                    toast("预处理请填写翻译api")
                    return text
                }
            } catch {
                log("翻译失败，使用原文");
                return text
            }
        } else {
            return text
        }
    },

}
$.exports = Apollo
