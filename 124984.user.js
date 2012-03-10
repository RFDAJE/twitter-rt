// ==UserScript==
// @name twitter-rt
// @namespace http://naonie.com/projects/twitter_rt.html
// @description traditional rt for twitter
// @version 0.2.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @include https://twitter.com/*
// ==/UserScript==

var TwitterRT = {
    insert_rt_archor: function(e) {
        var $target = $(e.target),
            is_single_page_tweet = $target.hasClass("component"),
            component_type = $target.attr("data-component-term"),
            is_reply_tweet = $target.hasClass("simple-tweet"),
            is_timeline_tweet = $target.hasClass("js-tweet-details-fixer");


        if (is_timeline_tweet) {
            e.data.that.append_rt_to_actions($target);
        }

        if (is_single_page_tweet && component_type === "tweet") {
            e.data.that.append_rt_to_actions($target);
        }

        if (is_reply_tweet) {
            e.data.that.append_rt_to_actions($target);
        }
    },

    rt_action_template: function() {
        return ['<li class="action-quote-container">',
                '<a class="with-icn js-action-quote" title="RT" href="#">',
                '<i class="action-quote"></i>', '<b>RT</b>', '</a>',
                '</li>'].join("");
    },

    append_rt_to_actions: function($target) {
        var $tweet_actions = $target.find(".action-fav-container");
        $(this.rt_action_template()).insertAfter($tweet_actions);
    },

    click_rt: function(e) {
        var $current_target = $(e.currentTarget),
            $tweet_wrap = e.data.that.find_tweet($current_target, 1),
            $tweet, tweet_id, screen_name, tweet_text;

        if (!$tweet_wrap) return;

        $tweet = $tweet_wrap.find(".original-tweet");

        if (!$tweet) return;

        tweet_id = $tweet.attr("data-tweet-id");
        screen_name = $tweet.attr("data-screen-name");

        if (!tweet_id || !screen_name) return;

        tweet_text = e.data.that.tweet_text($tweet, screen_name);

        new unsafeWindow.twttr.widget.TweetDialog({
            template: {title: "Quote @" + screen_name},
            defaultContent: tweet_text,
        }).open().focus();

        $(".twttr-dialog .tweet-button"
            ).removeClass("disabled"
            ).addClass("primary-btn");
    },

    tweet_text: function($tweet, screen_name) {
        var $tweet_text = $tweet.find(".js-tweet-text"),
            children = $tweet_text.contents(),
            len = children.length,
            texts = [], tmp, $child,
            components = ["RT", ["@", screen_name, ":"].join("")];

        for (i = 0; i < len; i++) {
            $child = $(children[i]);
            if ($child.hasClass("twitter-timeline-link")) {
                /* get the full url */
                tmp = $child.attr("data-expanded-url");
                texts.push(tmp);
            } else {
                tmp = $child.text();
                texts.push(tmp);
            }
        }

        components.push(texts.join(""));

        return components.join(" ");
    },

    find_tweet: function($target, count) {
        if (count > 10) return;

        var $tmp = $target.parent();

        if ($tmp.find(".tweet").length > 0) {
            return $tmp;
        } else {
            return this.find_tweet($tmp, count+1);
        }
    }
}


var quote_perforate_ff = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfcAhIWLBAV1R6IAAAA6klEQVQoz4WRsS6EQRSFv9nEqndF2EhEpdBoeABReQJqWoVa6SU8Ap1E4glEdIpV20LyJ9tJFMiG+ylm5t+/4lT3zDlzcudMUv5Er50E3juKwAdiRvjtHvhgxcQVMBsinDoEz1v5DsDbbAg/Z4vgdQkLHwEca0lwHzxpb8esD95kguEYwLfWcAGuVoJ6LK47xxp4VkkPvE8wAvPTflIDLrc8dClPbtoYTgDsgwdqoA5rMw7Ul05Xh3mH3XnbTrvVOwhRrzpHahzlOYit2sNpkS/V0NgulmcjlchXGjYYlWUST3yxwwIp/ffdv0kw9aGJP+G2AAAAAElFTkSuQmCC"

var quote_perforate_f6 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfcAhMOICerVGEmAAAA+ElEQVQoz4WRvS4FURSFvzNBZEhurp8wCtEpNbzBLbyB+wBajVLpCXTiFTQK8QZCp0BLQnKFThRfNM5WzNy5U3FOc9ba66zstXcy+PMU7SuAr04lAImiAwdlj5tW8MJqOUfCMMx+uAQeGc29AvDSwDCr8+B5U8zeAvhg1IJwAO63v7Oz4EWNMHsP4GcrOAarMZoicSKs02vbOwP2ujGvS6gg6iw/5QhiucWGiyBvyU1HZp8BnAF3DTOGC7WZ2Dd8mszKYZ1ixwn13h29faMADssJtwIOx46s1T2EBw11apgNtxr8aE6N5SsjNqiavSTu+GabaVL6b92/McO6ZwUIyE4AAAAASUVORK5CYII="

/* rt css style, normal 999, hover 333 */
GM_addStyle(".tweet .actions a.js-action-quote i {width: 16px;height: 16px;background-repeat: no-repeat;background-image: url(data:image/png;base64,"+quote_perforate_ff+");}");
GM_addStyle(".simple-tweet .actions a.js-action-quote i {width: 16px;height: 16px;background-repeat: no-repeat;background-image: url(data:image/png;base64,"+quote_perforate_f6+");}");

/* filter tweet bodies */
$(window).on("DOMNodeInserted", "", {"that": TwitterRT},
    TwitterRT.insert_rt_archor);

/* react on RT click */
$(window).on("mousedown", ".js-action-quote", {"that":TwitterRT},
    TwitterRT.click_rt);

