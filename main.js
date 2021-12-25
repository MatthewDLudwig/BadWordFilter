function filterFactory(replaceWith = "", words = [], options = { }) {
    const specialRegexChars = [
        "\\",
        ".",
        "+",
        "*",
        "?",
        "[",
        "^",
        "]",
        "$",
        "(",
        ")",
        "{",
        "}",
        "=",
        "!",
        "<",
        ">",
        "|",
        ":",
        "-",
    ];

    const characterOptions = {
        
    };

    const toFilter = [];

    let toReplaceWith = replaceWith ? replaceWith : "";

    function cleanRegex(word) {
        let clean = word;
        specialRegexChars.forEach(char => {
            clean = clean.split(char).join("\\" + char);
        });
        return clean;
    }

    function processParts(parts, process) {
        let processed = [];
        parts.forEach((it, i, arr) => {
            if (Array.isArray(it)) {
                processed.push(it);
                return;
            }
            
            let result = process(it, i, arr);
            if (Array.isArray(result)) processed.push(...result);
            else processed.push(result);
        });
        return processed;
    }

    function replaceInParts(parts, find, replace, addAtEnd = false) {
        return processParts(parts, (it) => {
            let processed = [];
            it.split(find).forEach((part, i, arr) => {
                processed.push(part);
                if (i < arr.length - (addAtEnd ? 0 : 1)) processed.push([ replace ])
            });
            return processed;
        });
    }

    function flattenParts(parts) {
        if (!Array.isArray(parts)) return parts;
        return parts.reduce((t, c) => {
            t.push(flattenParts(c));
            return t;
        }, []).join("");
    }

    function generalizeRegex(word, caseSensitive = false) {
        let generalized = [ word ];

        generalized = processParts(generalized, cleanRegex);
        generalized = replaceInParts(generalized, "", "\\s*", true);
        if (Array.isArray(generalized.slice(-1)[0]) && generalized.slice(-1)[0][0] == "\\s*") generalized.pop();

        Object.entries(characterOptions).forEach(entry => {
            let specialChar = entry[0];
            let options = "[" + entry[1].join("") + "]";
            generalized = replaceInParts(generalized, specialChar, options);
        });

        // If not case sensitive, then "i" flag is added.
        return new RegExp(flattenParts(generalized), caseSensitive ? undefined : "i");
    }

    let filterObject = {
        addToFilter : function (word) {
            toFilter.push(word);
            return this;
        },
        addAllToFilter : function (arr, caseSensitive = false) {
            arr.forEach(it => this.addToFilter(it, caseSensitive));
            return this;
        },
        addCharacterOption : function (char, option, caseSensitive = false) {
            if (!characterOptions[char]) characterOptions[char] = [];
            if (!characterOptions[char].includes(char)) characterOptions[char].push(char);
            if (!characterOptions[char].includes(option)) characterOptions[char].push(cleanRegex(option));
            if (!caseSensitive) {
                this.addCharacterOption(char.toUpperCase(), option, true);
                this.addCharacterOption(char.toLowerCase(), option, true);
            }
            return this;
        },
        addAllCharacterOptions : function (options, caseSensitive = false) {
            Object.entries(options).forEach(entry => this.addCharacterOption(entry[0], entry[1], caseSensitive));
            return this;
        },
        filterString : function (str, replaceWith = toReplaceWith, caseSenstive = false) {            
            return flattenParts(toFilter.reduce((t, c) => {
                let sep = c instanceof RegExp ? c : generalizeRegex(c, caseSenstive);
                let rep = typeof replaceWith == "function" ? replaceWith(c) : replaceWith;
                return replaceInParts(t, sep, rep);
            }, [ str ]));
        }
    };

    filterObject.addAllToFilter(words);
    filterObject.addAllCharacterOptions(options);

    return filterObject;
}
