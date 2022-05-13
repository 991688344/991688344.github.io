$(function() {
    var loadFlag = false
    $('a.social-icon.search').on('click', function() {
        $('body').css('width', '100%')
        $('body').css('overflow', 'hidden')
        $('.search-dialog').animate({}, function() {
            $('.search-dialog').css({
                'display': 'block',
                'animation': 'titlescale 0.5s'
            }), 300
        })
        $('#local-search-input input').focus()

        $('.search-mask').fadeIn();
        if (!loadFlag) {
            search(GLOBAL_CONFIG.localSearch.path)
            loadFlag = true
        }

        // shortcut: ESC
        document.addEventListener('keydown', function f(event) {
            if (event.code === 'Escape') {
                closeSearch()
                document.removeEventListener('keydown', f)
            }
        })
    })

    var closeSearch = function() {
        $('body').css('overflow', 'auto')
        $('.search-dialog').animate({}, function() {
            $('.search-dialog').css({
                'display': 'none'
            })
        })
        $('.search-mask').fadeOut();
    }
    $('.search-mask, .search-close-button').on('click', closeSearch)

    function search(path) {
        $.ajax({
            url: GLOBAL_CONFIG.root + path,
            dataType: 'json',
            success: function(xmlResponses) {
                // get the contents from search data
                var datas = $(xmlResponses).map(function() {
                    return {
                        title: this.title,
                        content: this.content,
                        url: this.url
                    }
                }).get()
                var $input = $('#local-search-input input')[0]
                //---- 添加结果区域----
                $('#local-stats').append('<div class="search-result-list" id="resultDis"></div>')
                $input.addEventListener('input', function() {
                    //var str = '<div class="search-result-list">'
                    //------清除展示区域-----
                    $('#resultDis').empty()
                    //
                    var keywords = this.value.trim().toLowerCase().split(/[\s]+/)
                    //$resultContent.innerHTML = ''
                    if (this.value.trim().length <= 0) {
                        $('.local-search-stats__hr').hide()
                        return
                    }
                    var count = 0
                    // 去除content中的<xxx> 和 ![xxx](xxxx)图像内容
                    var regSContent = new RegExp('!\\[[^\\]]*\\]\\([^\\)]*\\)|<[^>]+>|top_img: /.*(png|jpg|gif)|cover: /.*(png|jpg|gif)', "gi");
                    // perform local searching
                    datas.forEach(function(data) {
                        var isMatch = true
                        var dataTitle = data.title.trim().toLowerCase()
                        var dataContent = data.content.trim().replace(regSContent, '').toLowerCase() //去除<xxx>
                        var dataUrl = data.url
                        var indexTitle = -1
                        var indexContent = -1
                        var tmpDisplayContent = ""
                        // only match artiles with not empty titles and contents
                        if (dataTitle !== '' || dataContent !== '') {
                            keywords.forEach(function(keyword, i) {
                                indexTitle = dataTitle.indexOf(keyword)
                                indexContent = dataContent.indexOf(keyword)
                                if (indexTitle < 0 && indexContent < 0) {
                                    isMatch = false
                                } else {
                                    if (indexContent < 0) {
                                        indexContent = 0
                                    }
                                }
                            })
                        }
                        // show search results
                        if (isMatch) {
                            // 截取100长度的内容也展示出来,若只匹配了标题 则展示文章开头15个字符 ，对中间的关键词加粗处理
                            tmpDisplayContent = dataContent.substring(indexContent - 50, indexContent + 50)

                            keywords.forEach(function(keyword) {
                                var regS = new RegExp(keyword, "gi");
                                tmpDisplayContent = tmpDisplayContent.replace(regS, '<mark style="color: white; background-color:green">' + keyword + '</mark>');
                            });

                            $('#resultDis').append(
                                '<div style="border-top: 1px solid #dddddd" class="local-search__hit-item">' +
                                '<a href="' + dataUrl + '" class="search-result-title">' +
                                '<strong>《' + dataTitle + '》:</strong>   " ' + tmpDisplayContent + ' "' +
                                '</a>' +
                                '</div>'
                            )

                            count += 1
                            $('.local-search-stats__hr').show()
                        }
                    })
                    if (count === 0) {
                        str += '<div id="local-search__hits-empty">' + GLOBAL_CONFIG.localSearch.languages.hits_empty.replace(/\$\{query}/, this.value.trim()) +
                            '</div>'
                    }
                    $('#local-hits').append("<p>未搜索到相关结果</p>")
                })
            }
        })
    }
})