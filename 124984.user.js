// ==UserScript==
// @name twitter-rt
// @namespace http://naonie.com/projects/twitter_rt.html
// @description traditional rt for twitter
// @version 0.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @include https://twitter.com/*
// ==/UserScript==

/*

 TODO
 ====

 HIGH
 ----

 LOW
 ---
 * replace unsafeWindow


 FEATURE
 =======

 * conversation replies don't have rt
 * recent tweets don't have rt

 KNOWN ISSUE
 ===========

 At the moment, this script used unsafeWindow, use the script at your own risk.

*/

var TwitterRT = {
    insert_rt_archor: function(e) {
        var $node = $(e.relatedNode),
            is_detail_pane = $node.hasClass("tweet-components"),
            has_top_updates = $node.hasClass("js-stream-items"),
            is_tweet_detail = $node.hasClass("components-middle"),
            is_home_tweet = $node.hasClass("stream-item");

        if (is_detail_pane) {
            //console.log(e);
            e.data.that.append_rt_to_actions($(e.target), 1);
        }

        /* tweet detail page */
        if (is_tweet_detail) {
            e.data.that.append_rt_to_actions($(e.target), 1);
        }

        /* new update on top */
        if (has_top_updates) {
            /* only one send over */
            e.data.that.append_rt_to_actions($(e.target), 1);
        }

        /* first load */
        if (is_home_tweet) {
            /* has two send over, second one hidden */
            e.data.that.append_rt_to_actions($node, 2);
        }
    },

    rt_action_template: function() {
        return ['<a class="rt-action" title="RT" href="#">',
                '<span>', '<i></i>', '<b>RT</b>', '</span>', '</a>'].join("");
    },

    append_rt_to_actions: function($target, len) {
        /* put searching tweet actionis outside if, is too slow */
        $tweet_actions = $target.find(".tweet-actions");
        if ($tweet_actions.length === len) {
            $(this.rt_action_template()).appendTo($tweet_actions);
        }
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
GM_addStyle(".tweet-actions a.rt-action span i {width: 16px;height: 16px;background-repeat: no-repeat;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AIFEhwzojOe8wAAARtJREFUOMvtUrFKxFAQnHkYK00lJzZyFhZaWPgXfoBNQBCveAHB2Nj7AXJN5G4PtVME8Q8sxE+wFRFLC6sr7lJlbJIzxGdv4Va7+2bm7Q4L/EcwzKxvZg/t/nA47JnZa7M3FyA/AVhL03S1RT4nuV+WZfdXATO7BLARx/Fyi3zgnDssimIly7LPoECe55ske5J2kyRRE0TyStJZlmUf7YldnURRdAQAaZreNwGDwWCPJCTdhfxyjV+2JZU/AM7tVO/vIYHZCpK6JN1oNBpLmpJc996PAdR+vJlZRHLLe/8SmqA2Z5FkR1K/qqeSRHKB5DyAi+AKkh6lmXcCsFTltyTZwHWCApPJ5BjAcwWakjypTL2RdP3N1+nfOvsvSo5zRVSqwVIAAAAASUVORK5CYII=);} .tweet-actions a.rt-action:hover span i {width: 16px; height: 16px;background-repeat: no-repeat;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AIFEiojNpgf4gAAAV9JREFUOMvtkjFLw1AQx+/ynprStE27CKF+A6fSGF7aSqAOfoBuDl0EQRBxsrgITjo5uhUEEcTBpTgFE4s4OPsdjOLg0OJLyOM5aOVRg7ODN9397u7/7h0H8G+Z5rrukeu6D9Pc87yu4ziRyqga9Ho9GobhTRzHC5VKZVnNMcaOR6PRVqFQWFE5UQMhxKUQwjZNc9H3/ecJb7VaO5zz/WKx2AyC4C5z7Ha7vVqr1SRjbF3lnU5nvl6vJ4yx06w+beKMx+MNRIRqtXqtFkRR1JVSzlBKB78KAMASIoJlWUItSNPUAQAol8tpv9+fnRbAiWPbNhdCzCEiIKI0DKMZhuF9o9G45Zx/LzSfz28Oh8OTHxNomvaK+KknpcQkSQ6+Fvuivsg5P8z8AiHkQkqp5t4BAHK53PkUjzMFPM/b1XX9jBDCKaWPpVJpGwAgCIIrwzD2CCFvlNInXdfX/tbZfwDFeXJ9QZcrQQAAAABJRU5ErkJggg==);}");

/* filter tweet bodies */
$(window).on("DOMNodeInserted", "", {"that": TwitterRT},
    TwitterRT.insert_rt_archor);

/* react on RT click */
$(window).on("mousedown", ".rt-action", {"that":TwitterRT},
    TwitterRT.click_rt);

