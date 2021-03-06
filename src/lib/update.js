/*
  Copyright 2012 Christopher Hoobin. All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

  1. Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following
  disclaimer in the documentation and/or other materials provided
  with the distribution.

  THIS SOFTWARE IS PROVIDED BY CHRISTOPHER HOOBIN ''AS IS'' AND ANY
  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CHRISTOPHER HOOBIN OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  The views and conclusions contained in the software and documentation
  are those of the authors and should not be interpreted as representing
  official policies, either expressed or implied, of Christopher Hoobin.
*/

Components.utils.import("resource://gre/modules/Services.jsm");

Cmis.update = {
    // Upgrade the old directoryList format and replace it with user
    // friendly(er) JSON. This will enable labels and paths to contain
    // "|" and "!"  characters and lead the way to easy importing and
    // exporting of CMIS settings.
    v20130207: function() {
        let version = Cmis.preferences.value("directoryListVersion");

        if (version > 1) return;

        let list = Cmis.preferences.value("directoryList");

        // If the first character is a '[' it is safe :D to assume
        // that the directoryList has already been converted, i.e.,
        // user is running a -dev version.
        if (list[0] === '[') return;

        let items = [];

        // 99% of the time we need to translate the old directoryList format.
        let xs = list.split("|");

        xs.forEach(function (x) {
            let item = x.split("!");

            switch (item[0]) {
            case '.':
                let prefix = item[4];

                // Append %DEFAULT to the old style prefix
                // data, even if it is empty.
                prefix += "%DEFAULT"

                items.push({
                    type: "item",
                    depth: parseInt(item[1]),
                    name: item[2],
                    path: item[3],
                    format: prefix,
                    saveas: false
                });
                break;

            case '=':
                items.push({
                    type: "item",
                    depth: parseInt(item[1]),
                    name: item[2],
                    path: item[3],
                    format: "%DEFAULT",
                    saveas: true
                });
                break;

            case '-':
                items.push({
                    type: "separator",
                    depth: parseInt(item[1])
                });
                break;

            case '>':
                items.push({
                    type: "submenu",
                    depth: parseInt(item[1]),
                    name: item[2],
                    open: true
                });
                break;
            }
        });

        list = JSON.stringify(items);

        Cmis.preferences.value("directoryList", list);

        Cmis.preferences.value("directoryListVersion", 2);
    }
};
