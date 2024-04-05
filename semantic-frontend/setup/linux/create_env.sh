#!/bin/sh

__conda_setup="$($1/bin/conda 'shell.bash' 'hook')"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "$1/etc/profile.d/conda.sh" ]; then
        . "$1/etc/profile.d/conda.sh"
    else
        export PATH="$1/bin:$PATH"
    fi
fi
unset __conda_setup

conda env create --file $2