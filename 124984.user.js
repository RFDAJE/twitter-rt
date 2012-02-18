// ==UserScript==
// @name twitter-rt
// @namespace http://naonie.com/projects/twitter_rt.html
// @description traditional rt for twitter
// @version 0.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @include https://twitter.com/*
// ==/UserScript==

var TwitterRT = {
    insert_rt_archor: function(e) {
        var $target = $(e.target),
            is_actions = $target.hasClass("js-tweet-details-fixer");

        if (is_actions) {
            e.data.that.append_rt_to_actions($target, 1);
        }
    },

    rt_action_template: function() {
        return ['<li class="action-quote-container">',
                '<a class="with-icn js-action-quote" title="RT" href="#">',
                '<i class="action-quote"></i>', '<b>RT</b>', '</a>',
                '</li>'].join("");
    },

    append_rt_to_actions: function($target, len) {
        $tweet_actions = $target.find(".actions");
        $(this.rt_action_template()).appendTo($tweet_actions);
    },

    click_rt: function(e) {
        var $current_target = $(e.currentTarget),
            $tweet_wrap = e.data.that.find_tweet($current_target, 1),
            $tweet, tweet_id, screen_name, tweet_text;

        if (!$tweet_wrap) return;

        $tweet = $tweet_wrap.find(".tweet");

        if (!$tweet) return;

        tweet_id = $tweet.attr("data-tweet-id");
        screen_name = $tweet.attr("data-screen-name");

        if (!tweet_id || !screen_name) return;

        unsafeWindow.twttr.dialogs.reply({
            tweetId: tweet_id,
            screenName: screen_name,
            origin: "tweet-action-reply",
            input: "click",
            component: "stream",
            stream: "Home"
        }).open();

        tweet_text = e.data.that.tweet_text($tweet, screen_name);
        $(".twttr-dialog textarea").val(tweet_text);
    },

    tweet_text: function($tweet, screen_name) {
        var $tweet_text = $tweet.find(".tweet-text"),
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


/* rt css style, normal 999, hover 333 */
GM_addStyle(".actions a.js-action-quote i {width: 16px;height: 16px;background-repeat: no-repeat;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfcAhIWLBAV1R6IAAAA6klEQVQoz4WRsS6EQRSFv9nEqndF2EhEpdBoeABReQJqWoVa6SU8Ap1E4glEdIpV20LyJ9tJFMiG+ylm5t+/4lT3zDlzcudMUv5Er50E3juKwAdiRvjtHvhgxcQVMBsinDoEz1v5DsDbbAg/Z4vgdQkLHwEca0lwHzxpb8esD95kguEYwLfWcAGuVoJ6LK47xxp4VkkPvE8wAvPTflIDLrc8dClPbtoYTgDsgwdqoA5rMw7Ul05Xh3mH3XnbTrvVOwhRrzpHahzlOYit2sNpkS/V0NgulmcjlchXGjYYlWUST3yxwwIp/ffdv0kw9aGJP+G2AAAAAElFTkSuQmCC);}");

/* filter tweet bodies */
$(window).on("DOMNodeInserted", "", {"that": TwitterRT},
    TwitterRT.insert_rt_archor);

/* react on RT click */
$(window).on("mousedown", ".rt-action", {"that":TwitterRT},
    TwitterRT.click_rt);

